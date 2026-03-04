/**
 * Local Development Server
 * ------------------------
 * This script allows you to run your serverless contact handler locally.
 * It emulates the request/response objects that Vercel provides.
 */

require("dotenv").config();
const http = require("http");
const handler = require("./api/contact");
const gmailHandler = require("./api/gmail-contact");

const PORT = process.env.PORT || 5000;

const server = http.createServer(async (req, res) => {
    // Helper to read request body as JSON
    let body = "";
    req.on("data", chunk => { body += chunk.toString(); });

    req.on("end", async () => {
        try {
            // Create a mock body object for the handler
            if (body) {
                try {
                    req.body = JSON.parse(body);
                } catch (e) {
                    req.body = body; // Fallback to raw string
                }
            }

            // Add helper methods common in serverless environments
            res.status = (code) => {
                res.statusCode = code;
                return res;
            };
            res.json = (data) => {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
            };

            // Basic routing
            if (req.url === "/api/gmail-contact") {
                await gmailHandler(req, res);
            } else if (req.url === "/api/contact" || req.url === "/") {
                await handler(req, res);
            } else {
                res.status(404).json({ error: "Not Found" });
            }
        } catch (err) {
            console.error("Local Server Error:", err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Internal Server Error", message: err.message }));
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Techfit Backend running locally at http://localhost:${PORT}`);
    console.log(`📧 Contact: http://localhost:${PORT}/api/contact`);
    console.log(`📧 Gmail:   http://localhost:${PORT}/api/gmail-contact`);
    console.log(`Press Ctrl+C to stop`);
});
