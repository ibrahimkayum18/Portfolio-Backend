const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAdminEmail = async (data) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: "New Portfolio Message",
    html: `
      <h3>New Message</h3>
      <p><b>Name:</b> ${data.name}</p>
      <p><b>Email:</b> ${data.email}</p>
      <p><b>Message:</b> ${data.message}</p>
    `,
  });
};

const sendVisitorEmail = async (data) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: data.email,
    subject: "Message Received",
    html: `
      <h3>Hello ${data.name},</h3>
      <p>I have received your message.</p>
      <p>I will get back to you as soon as possible.</p>
      <br/>
      <p>Best Regards</p>
    `,
  });
};

module.exports = { sendAdminEmail, sendVisitorEmail };