const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.akvcfmt.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // await client.connect();

    const db = client.db("event-db");
    const eventCollection = db.collection("events");
    const joinedCollection = db.collection("joinedEvents");

    // get method
    app.get("/events", async (req, res) => {
      const result = await eventCollection.find().toArray();
      res.send(result);
    });

    app.get("/events/:id", async (req, res) => {
      const { id } = req.params;
      console.log(id);
      const result = await eventCollection.findOne({ _id: new ObjectId(id) });
      res.send({
        success: true,
        result,
      });
    });

    // post method
    app.post("/events", async (req, res) => {
      const data = req.body;

      const result = await eventCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });

    app.post("/join-event", async (req, res) => {
      const { eventId, userEmail, eventTitle, eventLocation, thumbnailUrl } =
        req.body;

      if (!userEmail) {
        return res.status(400).send({
          success: false,
          message: "You must need Login to join event",
        });
      }

      const alreadyJoined = await joinedCollection.findOne({
        eventId,
        userEmail,
      });

      if (alreadyJoined) {
        return res.send({
          success: false,
          message: "You have already joined this event",
        });
      }

      const result = await joinedCollection.insertOne({
        eventId,
        eventTitle,
        userEmail,
        eventLocation,
        thumbnailUrl,
        joinedAt: new Date(),
      });
      res.send({
        success: true,
        insertedId: result.insertedId,
      });
    });

    // join event with sorted
    app.get("/join-event/:email", async (req, res) => {
      const { email } = req.params;
      const joinedEvents = await joinedCollection
        .find({ userEmail: email })
        .sort({ joinedAt: 1 })
        .toArray();
      res.send({
        success: true,
        joinedEvents,
      });
    });

    // manage events ui data code
    app.get("/my-events", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res
          .status(400)
          .send({ success: false, message: "Email required" });
      }
      const result = await eventCollection.find({ createdBy: email }).toArray();
      res.send({ success: true, result });
    });

    // put method for specific users
    app.put("/events/:id", async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      const userEmail = updateData.userEmail;

      if (!userEmail) {
        return res.status(400).send({
          success: false,
          message: "User Email Required",
        });
      }

      const existingEvent = await eventCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!existingEvent) {
        return res
          .status(404)
          .send({ success: false, message: "Event not found" });
      }

      if (existingEvent.createdBy !== userEmail) {
        return res
          .status(403)
          .send({ success: false, message: "Unauthorized update" });
      }

      const updateDoc = {
        $set: {
          title: updateData.title,
          description: updateData.description,
          eventType: updateData.eventType,
          thumbnailUrl: updateData.thumbnailUrl,
          location: updateData.location,
          eventDate: updateData.eventDate,
        },
      };

      const result = await eventCollection.updateOne(
        { _id: new ObjectId(id) },
        updateDoc
      );

      res.send({
        success: true,
        result,
      });
    });

    // await client.db("admin").command({ ping: 1 });
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
