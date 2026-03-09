const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const blogCollection = client.db("IbrahimKayum").collection("blogs");
    const caseStudyCollection = client.db("IbrahimKayum").collection("case-studies");
    const workCollection = client.db("IbrahimKayum").collection("works");
    const contactCollection = client.db("IbrahimKayum").collection("contacts");

    // =====================
    // BLOG APIs (CRUD)
    // =====================

    app.post("/blogs", async (req, res) => {
      const result = await blogCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/blogs", async (req, res) => {
      const result = await blogCollection.find().toArray();
      res.send(result);
    });

    app.get("/blogs/:id", async (req, res) => {
      const result = await blogCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    app.patch("/blogs/:id", async (req, res) => {
      const result = await blogCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
      );
      res.send(result);
    });

    app.delete("/blogs/:id", async (req, res) => {
      const result = await blogCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // =====================
    // CASE STUDY APIs
    // =====================

    app.post("/case-studies", async (req, res) => {
      const result = await caseStudyCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/case-studies", async (req, res) => {
      const result = await caseStudyCollection.find().toArray();
      res.send(result);
    });

    app.get("/case-studies/:id", async (req, res) => {
      const result = await caseStudyCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    app.patch("/case-studies/:id", async (req, res) => {
      const result = await caseStudyCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
      );
      res.send(result);
    });

    app.delete("/case-studies/:id", async (req, res) => {
      const result = await caseStudyCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // =====================
    // WORK APIs
    // =====================

    app.post("/works", async (req, res) => {
      const result = await workCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/works", async (req, res) => {
      const result = await workCollection.find().toArray();
      res.send(result);
    });

    app.get("/works/:id", async (req, res) => {
      const result = await workCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    app.patch("/works/:id", async (req, res) => {
      const result = await workCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
      );
      res.send(result);
    });

    app.delete("/works/:id", async (req, res) => {
      const result = await workCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // =====================
    // CONTACT API
    // =====================

    app.post("/contact", async (req, res) => {
      try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
          return res.status(400).send({
            success: false,
            message: "All fields required",
          });
        }

        const contactData = {
          name,
          email,
          message,
          createdAt: new Date(),
          status: "Unread",
        };

        await contactCollection.insertOne(contactData);

        // Send Emails
        await sendAdminEmail(contactData);
        await sendVisitorEmail(contactData);

        res.status(201).send({
          success: true,
          message: "Message sent successfully",
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({
          success: false,
          message: "Server error",
        });
      }
    });

    app.get("/contact", async (req, res) => {
      const result = await contactCollection.find().toArray();
      res.send(result);
    });

    app.delete("/contact/:id", async (req, res) => {
      const result = await contactCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});