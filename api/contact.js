const nodemailer = require("nodemailer");

/* ---- CREATE TRANSPORTER ONCE ---- */
let transporter;

if (!transporter) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    pool: true,                // ✅ important
    maxConnections: 2,         // ✅ prevent overload
    maxMessages: 50,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

module.exports = async function handler(req, res) {

  /* ---- CORS HEADERS ---- */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      number,
      companyName,
      enquiryFor,
      requirement
    } = req.body || {};

    if (!firstName || !lastName || !email || !number || !companyName || !enquiryFor) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    /* ---- SEND ADMIN MAIL ---- */
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `New Enquiry - ${firstName} ${lastName}`,
      html: `
        <h2>New Website Enquiry</h2>
        <hr/>
        <p><b>Name:</b> ${firstName} ${lastName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${number}</p>
        <p><b>Company:</b> ${companyName}</p>
        <p><b>Enquiry For:</b> ${enquiryFor}</p>
        <p><b>Requirement:</b><br/>${requirement || "N/A"}</p>
      `
    });

    /* ---- AUTO REPLY ---- */
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Thanks for contacting Techfit Active",
      html: `
        <p>Hi ${firstName},</p>
        <p>Thanks for your enquiry. We'll contact you soon.</p>
        <br/>
        <p>– Techfit Active Team</p>
      `
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Mail error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
};