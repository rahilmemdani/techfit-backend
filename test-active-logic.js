const handler = require("./api/contact");
require("dotenv").config();

async function test() {
    const req = {
        method: "POST",
        body: {
            firstName: "Test",
            lastName: "Receiver",
            email: process.env.GMAIL_USER, // Sending to yourself to verify it arrives
            number: "9876543210",
            companyName: "Techfit Test Lab",
            enquiryFor: "Corporate Fitness Facility Management",
            requirement: "Verifying that the client/receiver (external address) gets the mail via the new Gmail pipe."
        }
    };

    const res = {
        setHeader: () => { },
        status: (code) => {
            console.log("Response Status:", code);
            return {
                json: (data) => console.log("Response JSON:", data),
                end: () => console.log("Response Ended")
            };
        }
    };

    console.log("🚀 Testing Techfit Active (api/contact.js) with Gmail Pipe...");
    await handler(req, res);
}

test();
