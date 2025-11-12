const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri =
 `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.akvcfmt.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const db = client.db('event-db')
    const eventCollection = db.collection('events')
    
    // get method
    app.get('/events', async (req, res)=>{
      const result = await eventCollection.find().toArray()
      res.send(result)
    })

    app.get('/events/:id', async (req, res)=>{
      const {id} = req.params
      console.log(id);
      const result = await eventCollection.findOne({_id: new ObjectId(id)})
      res.send({
        success: true,
        result
      })
    })

    // post method
    app.post('/events', async (req, res)=>{
      const data = req.body
      
      const result = await eventCollection.insertOne(data)
      res.send({
        success: true,
        result
      })
    })


    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Social development event server is running");
});

app.listen(port, () => {
  console.log(`Social development event server is running on port: ${port}`);
});
