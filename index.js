
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const nodemailer = require("nodemailer");

app.use(express.json());

// ✅ FIXED CORS (only once)
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);



const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// ================= EMAIL SETUP =================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// verify email config
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email config error:", error);
  } else {
    console.log("✅ Email server ready");
  }
});


// send email to visitor
const sendVisitorEmail = async (data) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: data.email,
    subject: "Message Received",
    html: `
      <h3>Hi ${data.name},</h3>
      <p>Thanks for contacting me. I have received your message and will reply soon.</p>
    `,
  });
};

// send email to you (admin)
const sendAdminEmail = async (data) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: "New Contact Message",
    html: `
      <h3>New Message Received</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Message:</strong> ${data.message}</p>
    `,
  });
};

// ================= MONGODB =================

const uri = process.env.MONGO_URI;
console.log("Mongodb URL = ", uri)

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

    const db = client.db("IbrahimKayum");

    const blogCollection = db.collection("blogs");
    const caseStudyCollection = db.collection("case-studies");
    const workCollection = db.collection("works");
    const contactCollection = db.collection("contacts");

    // ================= BLOG =================

    app.post("/blogs", async (req, res) => {
      try {
        const result = await blogCollection.insertOne(req.body);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to create blog" });
      }
    });

    app.get("/blogs", async (req, res) => {
      const result = await blogCollection.find().toArray();
      res.send(result);
    });

    app.get("/blogs/:id", async (req, res) => {
      try {
        if (!ObjectId.isValid(req.params.id)) {
          return res.status(400).send({ error: "Invalid ID" });
        }

        const result = await blogCollection.findOne({
          _id: new ObjectId(req.params.id),
        });

        res.send(result);
      } catch {
        res.status(500).send({ error: "Failed to fetch blog" });
      }
    });

    app.patch("/blogs/:id", async (req, res) => {
      try {
        const result = await blogCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body }
        );
        res.send(result);
      } catch {
        res.status(500).send({ error: "Update failed" });
      }
    });

    app.delete("/blogs/:id", async (req, res) => {
      const result = await blogCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // ================= CONTACT =================

    app.post("/contact", async (req, res) => {
      try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
          return res.status(400).send({
            success: false,
            message: "All fields are required",
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

        // ✅ SEND EMAILS
        await sendVisitorEmail(contactData);
        await sendAdminEmail(contactData);

        res.status(201).send({
          success: true,
          message: "Message sent successfully!",
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

    // ================= HEALTH CHECK =================

    await client.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB Connected");
  } finally {
    // keep connection alive
  }
}

run().catch(console.dir);

// ================= ROOT =================

app.get("/", (req, res) => {
  res.send("Server is running");
});

// ================= START =================

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});