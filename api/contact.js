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
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
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

    console.log("Processing enquiry from:", safe.email);

    /* ---------------- SEND ADMIN EMAIL ---------------- */
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `New Website Enquiry - ${safe.firstName} ${safe.lastName}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
          <div style="background: #111; color: #fff; padding: 25px; text-align: center;">
            <a href="https://techfitactive.com" style="text-decoration: none;">
              <img src="https://www.techfitactive.com/techfit-active-logo.png" alt="Techfit Active" style="max-height: 50px; width: auto; border: 0;">
            </a>
            <p style="margin: 10px 0 0; opacity: 0.8; font-size: 14px;">Website Lead Notification</p>
          </div>
          <div style="padding: 30px; background-color: #fff;">
            <p style="font-size: 16px; color: #333; margin-bottom: 25px;">You have received a new enquiry from the website contact form.</p>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #777; width: 150px;"><strong>Client Name</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #111;">${safe.firstName} ${safe.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #777;"><strong>Email Address</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #111;"><a href="mailto:${safe.email}" style="color: #ff3e3e; text-decoration: none;">${safe.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #777;"><strong>Phone Number</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #111;">${safe.number}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #777;"><strong>Company</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #111;">${safe.companyName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #777;"><strong>Enquiry For</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #111;">${safe.enquiryFor}</td>
              </tr>
            </table>

            <div style="margin-top: 25px; padding: 20px; background-color: #f9f9f9; border-radius: 6px;">
              <strong style="display: block; margin-bottom: 10px; color: #333;">Requirement Details:</strong>
              <p style="color: #444; margin: 0; line-height: 1.6; white-space: pre-wrap;">${safe.requirement}</p>
            </div>
          </div>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; color: #999; font-size: 12px;">
            This email was sent automatically from the Techfit Active website.
          </div>
        </div>
      `,
    });

    /* ---------------- AUTO REPLY ---------------- */
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Thank You for Contacting Techfit Active",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
          <div style="background: #111; color: #fff; padding: 25px; text-align: center;">
            <a href="https://techfitactive.com" style="text-decoration: none;">
              <img src="https://www.techfitactive.com/techfit-active-logo.png" alt="Techfit Active" style="max-height: 50px; width: auto; border: 0;">
            </a>
          </div>
          <div style="padding: 30px; background-color: #fff; text-align: center;">
            <h2 style="color: #111; margin-top: 0;">Hi ${safe.firstName},</h2>
            <p style="font-size: 16px; color: #444; line-height: 1.6;">
              Thank you for reaching out to us. We have received your enquiry regarding <strong>${safe.enquiryFor}</strong>.
            </p>
            <p style="font-size: 16px; color: #444; line-height: 1.6;">
              Our team will review your requirements and get back to you as soon as possible.
            </p>
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              <p style="margin: 0; color: #111; font-weight: bold;">Techfit Active Team</p>
              <p style="margin: 5px 0 0; color: #777; font-size: 14px;">Premium Fitness Asset Management</p>
              <p style="margin: 10px 0 0; font-size: 14px;">
                <a href="https://techfitactive.com" style="color: #ff3e3e; text-decoration: none;">techfitactive.com</a>
              </p>
            </div>
          </div>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; color: #999; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Techfit Active. All rights reserved.
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("MAIL ERROR DETAILS:", {
      message: err.message,
      stack: err.stack,
      code: err.code,
      command: err.command
    });
    return res.status(500).json({
      error: "Failed to send email",
      message: "Our mail server is currently experiencing issues. Please try again later or contact us directly.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};