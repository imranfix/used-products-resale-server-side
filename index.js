const express = require('express')
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();
const port = process.env.PORT || 5000;



// use middle wares:
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z6welky.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

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


         
         // 2.
        // app.get('/category/:id', async(req, res) =>{
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const categoryItem = await categoryCollection.findOne(query);
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
         app.get('/bookings', async(req, res) =>{
            const email = req.query.email;
            const query = { email: email };
            const bookings = await buyerBookingCollection.find(query).toArray();
            res.send(bookings);
         });

        //  5. create buyers user data:
        app.post('/buyerUsers', async(req, res) =>{
            const buyerUser = req.body;
            const result = await buyerUsersCollection.insertOne(buyerUser);
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