require("dotenv").config();
const nodemailer = require("nodemailer");

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
        rejectUnauthorized: false,
    },
});

async function run() {
    try {
        const info = await transporter.sendMail({
            from: `"Techfit Active" <${process.env.GMAIL_USER}>`,
            to: "rmemdanib@gmail.com",
            subject: "Test via GMAIL USER",
            text: "Testing it"
        });
        console.log("Success with GMAIL USER:", info.messageId);
    } catch (err) {
        console.error("Failed with GMAIL USER:", err.message);
    }

    try {
        const info = await transporter.sendMail({
            from: `"Techfit Active" <${process.env.SMTP_USER}>`,
            to: "rmemdanib@gmail.com",
            subject: "Test via SMTP USER",
            text: "Testing it"
        });
        console.log("Success with SMTP USER:", info.messageId);
    } catch (err) {
        console.error("Failed with SMTP USER:", err.message);
    }
}

run();
