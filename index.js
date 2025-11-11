// Import the 'dotenv' package. This is used to load environment variables from a .env file
// into 'process.env', allowing you to separate configuration from code.
import dotenv from "dotenv";

// Import the 'connectDB' function from the database configuration file.
// This function will handle the logic for connecting to your MongoDB database.
import connectDB from "./db/index.js";


import { app } from "./app.js";

// Import the configured Express 'app' instance from app.js.
// This is the core of your web server.
import { app } from "./app.js";

// Configure dotenv to load the environment variables.
dotenv.config({
    // Specify the path to your environment file.
    path: "./env"
});

// Call the function to connect to the database.
// This returns a promise, so we can chain .then() and .catch() to handle success and failure.
connectDB()
.then(() => {
    // This .then() block executes if the database connection is successful.
    // Start the Express server and make it listen for incoming requests.
    app.listen(process.env.PORT || 8000, () => {
        // This callback function executes once the server is successfully running.
       console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    // This .catch() block executes if the database connection fails.
    console.log("MONGO db connection failed !!! ", err);
})
