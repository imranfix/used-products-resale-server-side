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


        // 1. get read data form category:
        app.get('/category', async(req, res) =>{
            const query = {}
            const cursor = categoryCollection.find(query);
            const category = await cursor.toArray();
            res.send(category);
        });

        // 3.
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