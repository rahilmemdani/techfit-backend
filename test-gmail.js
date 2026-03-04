/**
 * Gmail Connection Verification Script
 * ------------------------------------
 * Run:  node test-gmail.js
 */

require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

async function run() {
    console.log("──────────────────────────────────────");
    console.log("  Gmail Connection Test (Updated)");
    console.log("──────────────────────────────────────");
    console.log(`  User : ${process.env.GMAIL_USER}`);
    console.log(`  From : ${process.env.GMAIL_FROM}`);
    console.log("──────────────────────────────────────\n");

    /* ---- Step 1: Verify connection ---- */
    console.log("⏳ Verifying Gmail connection...");
    try {
        await transporter.verify();
        console.log("✅ Gmail connection successful!\n");
    } catch (err) {
        console.error("❌ Gmail connection FAILED:");
        console.error(`   ${err.message}\n`);
        console.log("TIP: Ensure you have 2-Step Verification ON and are using a 16-character App Password.");
        process.exit(1);
    }

    /* ---- Step 2: Send a test email with GetAQuote fields ---- */
    console.log("⏳ Sending test email with GetAQuote fields...");
    try {
        const info = await transporter.sendMail({
            from: process.env.GMAIL_FROM,
            to: process.env.GMAIL_USER,
            subject: "✅ Gmail Integration Test - GetAQuote Fields",
            html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; background: #111; color: #fff; text-align: center;">
          <img src="https://techfittech.com/wp-content/uploads/2026/01/logo-1.png" alt="Techfit Tech" style="max-height: 50px; width: auto; border: 0;">
          <h2 style="color: #4facfe; margin-top: 20px;">Gmail Integration Successful</h2>
          <p>This is a test submission matching the <b>GetAQuote</b> form fields.</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td><b>Name:</b></td><td>Test User</td></tr>
            <tr><td><b>Gym:</b></td><td>Test Gym</td></tr>
            <tr><td><b>City:</b></td><td>Mumbai</td></tr>
            <tr><td><b>Requirement:</b></td><td>mma-cages</td></tr>
            <tr><td><b>Phone:</b></td><td>9876543210</td></tr>
          </table>
          <hr>
          <p><small>Verified at ${new Date().toLocaleString()}</small></p>
        </div>
      `,
        });

        console.log("✅ Test email sent!");
        console.log(`   Message ID : ${info.messageId}`);
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
