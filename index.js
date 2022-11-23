const express = require('express')
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;



// use middle wares:
app.use(cors());
app.use(express.json());



// testing route:
app.get('/', (req, res) =>{
    res.send("New BOOKS API server is running");
});


app.listen( port, () =>{
    console.log(`SECOND HAND BOOKS SERVER IS RUNNING ON PORT: ${port}`);
})