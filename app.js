// Import the 'express' library, a web application framework for Node.js.
import express from "express";

// Import the 'cors' middleware to enable Cross-Origin Resource Sharing.
// This allows your frontend, served from a different origin, to make requests to this backend.
import cors from "cors";

// Import the 'cookie-parser' middleware.
// This is used to parse Cookie header and populate req.cookies with an object keyed by the cookie names.
import cookieParser from "cookie-parser";

// Create an instance of the Express application. This 'app' object will be used to configure the server.
const app = express();

// Use the 'cors' middleware. This must be configured to allow requests from your frontend's origin.
app.use(cors({
    // 'origin' specifies which frontend URL is allowed to make requests.
    // Using an environment variable (process.env.CORS_ORIGIN) is a best practice for security and flexibility.
    origin: process.env.CORS_ORIGIN,
    // 'credentials: true' allows the frontend to send cookies with its requests, which is essential for authentication.
    credentials: true
}))

// Use the built-in 'express.json' middleware. This parses incoming requests with JSON payloads.
// The 'limit' option prevents the server from crashing due to very large request bodies.
app.use(express.json({limit: "16kb"}))

// Use the built-in 'express.urlencoded' middleware. This parses incoming requests with URL-encoded payloads (e.g., from HTML forms).
// The 'extended: true' option allows for parsing rich objects and arrays from the URL-encoded data.
// The 'limit' option is also set here for security.
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// Use the 'express.static' middleware to serve static files like images, CSS, and JavaScript.
// It serves files from the 'public' directory in your project root.
app.use(express.static("public"))

// Use the 'cookie-parser' middleware to enable reading and writing cookies on the server.
app.use(cookieParser())

// Export the configured 'app' instance. This allows other files, like your main 'index.js',
// to import and use this app to start the server.
export { app }