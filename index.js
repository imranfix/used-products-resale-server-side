const express = require('express')
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const jwt = require('jsonwebtoken');
require('dotenv').config();
// stripe secret key:
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;



// use middle wares:
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z6welky.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// jwt middleware function:
function verifyJWT(req, res, next){
    // console.log('token inside verifyJWT', req.headers.authorization);
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('Unauthorized Access');

    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden Access'})
        }
        req.decoded = decoded;
        next()
    })
}


async function run(){
    try{

        const categoryCollection = client.db('oldBook').collection('category');
        const productsCollection = client.db('oldBook').collection('products');
        const buyerBookingCollection = client.db('oldBook').collection('bookings');
        const buyerUsersCollection = client.db('oldBook').collection('buyerUsers');
        const selllersCollection = client.db('oldBook').collection('sellers');

        // verifyAdmin:
        const verifyAdmin = async(req, res, next) =>{
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
             const user = await buyerUsersCollection.findOne(query);
            if(user?.role !== 'admin'){
                return res.status(403).send({message: 'Forbidden Access'})
            }

            next();

        }


        // 1. get read data form category:
        app.get('/category', async(req, res) =>{
            const query = {}
            const cursor = categoryCollection.find(query);
            const category = await cursor.toArray();
            res.send(category);
        });

        // 2. get read data form products:
        app.get('/products', async(req, res) =>{
            const query = {}
            const cursor = productsCollection.find(query);
            const product = await cursor.toArray();
            res.send(product)
         });


         
         // 2(ai vabe korle hobe):
        // app.get('/category/:id', async(req, res) =>{
        //     const id = req.params.id;
        //     const query = { category_id: category_id };
        //     const categoryItem = await categoryCollection.find(query);
        //     res.send(categoryItem);
        // });
 

         // 3.
        // app.get('/products/:id', async(req, res) =>{
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const productsItem = await productsCollection.findOne(query);
        //     res.send(categoryItem);
        // });


        // 3.create data by post:
         app.post('/bookings', async(req, res) =>{
            const booking = req.body
            // console.log(booking);
            const result = await buyerBookingCollection.insertOne(booking);
            res.send(result);
         });

        //  4. get data form bookings:
         app.get('/bookings', verifyJWT, async(req, res) =>{
            const email = req.query.email;
            const decodedEmail = req.decoded.email
            if(email !== decodedEmail){
                return res.status(403).send({message: 'Forbidden Access'})
            }

            const query = { email: email };
            const bookings = await buyerBookingCollection.find(query).toArray();
            res.send(bookings);
         });

        //  14. get read specific data form bookings:
        app.get('/bookings/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await buyerBookingCollection.findOne(query);
            res.send(booking);
        });

        // 15. stripe payment gateway :
            app.post('/create-payment-intent', async(req, res) =>{
                const booking = req.body;
                const price = booking.price;
                const amount = price * 100 ;
                // console.log(booking);

                const paymentIntent = await stripe.paymentIntents.create({
                    currency: 'usd',
                    amount: amount,
                    "payment_method_types":[
                        "card"
                    ],
                });
                res.send({
                    clientSecret: paymentIntent.client_secret,
                });
            })


          // 6. jwt token:
        app.get('/jwt', async(req, res) =>{
            const email = req.query.email;
            const query = { email: email }
            const user= await buyerUsersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN,{expiresIn: '1h'})
                return res.send({accessToken: token});
            }
            console.log(user);
            res.status(403).send({accessToken: ''})
        });



        // 8.
        app.get('/buyerUsers', async (req, res) =>{
            const query = {};
            const users = await buyerUsersCollection.find(query).toArray();
            res.send(users);
        });

        // 10. make-admin role: 
        app.get('/buyerUsers/admin/:email', async(req, res) =>{
            const email = req.params.email;
            const query = { email }
            const user = await buyerUsersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'});

        });



        // 9.
        app.get('/buyerUsers/admin/:email', async(req, res) =>{
                const email = req.params.email;
                const query = { email }
                const user = await buyerUsersCollection.findOne(query);
              
                res.send({isAdmin: user?.role === 'admin'});
        });

  


        //  5. create buyers user data:
        app.post('/buyerUsers', async(req, res) =>{
            const buyerUser = req.body;
            const result = await buyerUsersCollection.insertOne(buyerUser);
            res.send(result);
        });

        // 7.
        app.put('/buyerUsers/admin/:id', verifyJWT, verifyAdmin, async(req, res) =>{ 
           
            const id = req.params.id;
            const filter = { _id: ObjectId(id)}
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await buyerUsersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });


        // 13. delete add product data:
        app.delete('/sellers/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await selllersCollection.deleteOne(filter);
            res.send(result);
        })


        // 12. get data from add product:
        app.get('/sellers', verifyJWT, verifyAdmin, async(req, res) =>{
            const query = {};
            const seller = await selllersCollection.find(query).toArray();
            res.send(seller);
        })

        
        // 11. create data form add product :
        app.post ('/sellers', verifyJWT, verifyAdmin, async(req, res) =>{
            const seller = req.body;
            const result = await selllersCollection.insertOne(seller);
            res.send(result);
        })



       

    }
    finally{

    }
}

run().catch(err => console.error(err));




// testing route:
app.get('/', (req, res) =>{
    res.send("New BOOKS API server is running");
});


app.listen( port, () =>{
    console.log(`SECOND HAND BOOKS SERVER IS RUNNING ON PORT: ${port}`);
})