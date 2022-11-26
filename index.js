const express = require('express')
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;



// use middle wares:
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z6welky.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// jwt middleware function:
function verifyJWT(req, res, next){
    console.log('token inside verifyJWT', req.headers.authorization);
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
            console.log(booking);
            const result = await buyerBookingCollection.insertOne(booking);
            res.send(result);
         });

        //  4. get data form bookings:
         app.get('/bookings', verifyJWT, async(req, res) =>{
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if(email !==decodedEmail){
                return res.status(403).send({message: 'Forbidden Access'})
            }

            const query = { email: email };
            const bookings = await buyerBookingCollection.find(query).toArray();
            res.send(bookings);
         });

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
        })
  


        //  5. create buyers user data:
        app.post('/buyerUsers', async(req, res) =>{
            const buyerUser = req.body;
            const result = await buyerUsersCollection.insertOne(buyerUser);
            res.send(result);
        });

       

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