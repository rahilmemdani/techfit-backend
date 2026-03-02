/**
 * SMTP Connection Verification Script
 * ------------------------------------
 * Run:  node test-smtp.js
 *
 * This script verifies that your SMTP credentials and server
 * are correctly configured by attempting to authenticate and
 * optionally sending a test email to yourself.
 */

require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
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
    console.log("──────────────────────────────────────");
    console.log("  SMTP Connection Test");
    console.log("──────────────────────────────────────");
    console.log(`  Host : ${process.env.SMTP_HOST}`);
    console.log(`  Port : ${process.env.SMTP_PORT}`);
    console.log(`  User : ${process.env.SMTP_USER}`);
    console.log(`  From : ${process.env.SMTP_FROM}`);
    console.log("──────────────────────────────────────\n");

    /* ---- Step 1: Verify connection ---- */
    console.log("⏳ Verifying SMTP connection...");
    try {
        await transporter.verify();
        console.log("✅ SMTP connection successful!\n");
    } catch (err) {
        console.error("❌ SMTP connection FAILED:");
        console.error(`   ${err.message}\n`);
        process.exit(1);
    }

    /* ---- Step 2: Send a test email ---- */
    console.log("⏳ Sending test email to yourself...");
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.SMTP_USER,
            subject: "✅ SMTP Test – Techfit Backend",
            html: `
        <h2>SMTP Test Successful</h2>
        <p>If you are reading this, your email configuration is working correctly.</p>
        <p><small>Sent at ${new Date().toISOString()}</small></p>
      `,
        });

        console.log("✅ Test email sent!");
        console.log(`   Message ID : ${info.messageId}`);
        console.log(`   Accepted   : ${info.accepted.join(", ")}`);
        if (info.rejected.length) {
            console.log(`   Rejected   : ${info.rejected.join(", ")}`);
        }
    } catch (err) {
        console.error("❌ Failed to send test email:");
        console.error(`   ${err.message}`);
        process.exit(1);
    }

    console.log("\n──────────────────────────────────────");
    console.log("  All checks passed! 🎉");
    console.log("──────────────────────────────────────");
}

run();
