const nodemailer = require("nodemailer");

// Load .env locally (safe if not present in production)
try {
  require("dotenv").config();
} catch (e) { }

/* ---------------- HELPERS ---------------- */

/** Simple email format check */
function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

/** Strip HTML tags & encode dangerous characters to prevent injection */
function sanitize(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ---------------- TRANSPORTER ---------------- */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // MUST be false for 587
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Needed for many cPanel servers
  },
});

/* ---------------- HANDLER ---------------- */

module.exports = async function handler(req, res) {
  /* ---- CORS ---- */
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
    /* ---- Fix body parsing for serverless ---- */
    let body = req.body;

    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const {
      firstName,
      lastName,
      email,
      number,
      companyName,
      enquiryFor,
      requirement,
    } = body || {};

    /* ---- Basic Validation ---- */
    if (
      !firstName ||
      !lastName ||
      !email ||
      !number ||
      !companyName ||
      !enquiryFor
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    /* ---- Email Format Validation ---- */
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    /* ---- Sanitize all inputs ---- */
    const safe = {
      firstName: sanitize(firstName),
      lastName: sanitize(lastName),
      email: sanitize(email),
      number: sanitize(number),
      companyName: sanitize(companyName),
      enquiryFor: sanitize(enquiryFor),
      requirement: sanitize(requirement) || "N/A",
    };

    console.log("Sending email from:", process.env.SMTP_USER);

    /* ---------------- SEND ADMIN EMAIL ---------------- */
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      replyTo: email, // raw email is safe here (nodemailer handles it)
      subject: `New Enquiry - ${safe.firstName} ${safe.lastName}`,
      html: `
        <h2>New Website Enquiry</h2>
        <hr/>
        <p><b>Name:</b> ${safe.firstName} ${safe.lastName}</p>
        <p><b>Email:</b> ${safe.email}</p>
        <p><b>Phone:</b> ${safe.number}</p>
        <p><b>Company:</b> ${safe.companyName}</p>
        <p><b>Enquiry For:</b> ${safe.enquiryFor}</p>
        <p><b>Requirement:</b><br/>${safe.requirement}</p>
      `,
    });

    /* ---------------- AUTO REPLY ---------------- */
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Thanks for contacting Techfit Active",
      html: `
        <p>Hi ${safe.firstName},</p>
        <p>Thanks for your enquiry. We'll contact you soon.</p>
        <br/>
        <p>– Techfit Active Team</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("MAIL ERROR:", err);
    return res.status(500).json({
      error: "Failed to send email",
      details: err.message,
    });
  }
};