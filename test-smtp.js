const nodemailer = require("nodemailer");
require("dotenv").config();

async function run() {
    console.log("──────────────────────────────────────");
    console.log("  SMTP Connection Test (Techfit Active)");
    console.log("──────────────────────────────────────");
    console.log("  Host : " + process.env.SMTP_HOST);
    console.log("  User : " + process.env.SMTP_USER);
    console.log("  From : " + process.env.SMTP_FROM);
    console.log("──────────────────────────────────────\n");

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

    try {
        console.log("⏳ Verifying SMTP connection...");
        await transporter.verify();
        console.log("✅ SMTP connection successful!\n");

        const testEmail = process.env.SMTP_USER; // Send to self as test

        console.log(`⏳ Sending test email to ${testEmail}...`);
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: testEmail,
            subject: "✅ SMTP Test - Techfit Active",
            html: `
        <div style="font-family: sans-serif; padding: 20px; background: #111; color: #fff; text-align: center;">
          <img src="https://www.techfitactive.com/techfit-active-logo.png" alt="Techfit Active" style="max-height: 50px; width: auto; border: 0;">
          <h2 style="color: #ff3e3e; margin-top: 20px;">SMTP Connection Successful</h2>
          <p>This confirms that the Techfit Active SMTP settings are working.</p>
        </div>
      `,
        });

        console.log("✅ Test email sent!");
        console.log("   Message ID : " + info.messageId);
        console.log("\n──────────────────────────────────────");
        console.log("  All checks passed! 🎉");
        console.log("──────────────────────────────────────");
    } catch (error) {
        console.error("\n❌ FAILED:");
        console.error("   Error Name:", error.name);
        console.error("   Error Message:", error.message);
        if (error.code) console.error("   Error Code:", error.code);
        if (error.command) console.error("   Command:", error.command);
        console.error("\n──────────────────────────────────────");
    }
}

run();
