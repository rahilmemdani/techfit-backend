require("dotenv").config();
const handler = require("./api/contact.js");

async function run() {
    const req = {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: {
            firstName: "Test",
            lastName: "User",
            email: "rmemdanib@gmail.com",
            number: "+1234567890",
            companyName: "Test Co",
            enquiryFor: "General Inquiry",
            requirement: "This is a test request via the updated API.",
        },
    };

    const res = {
        setHeader: (k, v) => console.log(`Header set: ${k}=${v}`),
        status: (code) => {
            console.log(`Status set: ${code}`);
            return {
                json: (data) => console.log("Response JSON:", data),
                end: () => console.log("Response Ended"),
            };
        },
    };

    await handler(req, res);
}

run();
