require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  })
);

// ================= EMAIL SETUP =================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Email configuration error:", error);
  } else {
    console.log("✅ Email server is ready");
  }
});

// ================= SEND EMAIL TO VISITOR =================

const sendVisitorEmail = async ({ name, email }) => {
  await transporter.sendMail({
    from: `"Ibrahim Kayum" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Thank you for contacting me!",
    html: `
      <h2>Hello ${name},</h2>

      <p>Thank you for reaching out through my portfolio website.</p>

      <p>I have successfully received your message and will get back to you as soon as possible.</p>

      <p>Best Regards,<br><br>
      <strong>S M Ibrahim Kayum</strong><br>
      Shopify Developer & CRO Specialist<br>
      WhatsApp: 01609640109</p>
    `,
  });
};

// ================= SEND EMAIL TO ADMIN =================

const sendAdminEmail = async ({ name, email, message }) => {
  await transporter.sendMail({
    from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: "📩 New Contact Form Submission",
    html: `
      <h2>New Contact Form Message</h2>

      <p><strong>Name:</strong> ${name}</p>

      <p><strong>Email:</strong> ${email}</p>

      <p><strong>Message:</strong></p>

      <p>${message}</p>
    `,
  });
};

// ================= CONTACT ROUTE =================

app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).send({
        success: false,
        message: "All fields are required.",
      });
    }

    // Send email to yourself
    await sendAdminEmail({ name, email, message });

    // Send confirmation email to visitor
    await sendVisitorEmail({ name, email });

    res.status(200).send({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Email Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to send message.",
    });
  }
});

// ================= ROOT =================

app.get("/", (req, res) => {
  res.send("Server is running.");
});

// ================= START SERVER =================

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});