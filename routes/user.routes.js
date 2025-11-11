// Import the 'Router' class from the 'express' library to create a new router object.
import { Router } from "express"; 
// Import the 'registerUser' controller function, which will handle the logic for user registration.
import { registerUser } from "../controllers/user.controller.js"; 
// Import the 'upload' middleware from 'multer.middleware.js'. This is configured to handle multipart/form-data, which is primarily used for uploading files.
import {upload} from "../middlewares/multer.middleware.js"; 

// Create a new instance of an Express router.
const router = Router(); 

// Define a route on the router.
router.route("/register").post( // This route will respond to HTTP POST requests on the "/register" path.
    // This is the middleware that will be executed before the 'registerUser' controller.
    // 'upload.fields' is a multer function that accepts an array of objects, where each object specifies a file field to be expected in the form data.
    upload.fields([ 
        { // First file field configuration.
            name:"avatar", // The name of the field in the form that will contain the avatar image.
            maxCount:1 // The maximum number of files that can be uploaded for this field.
        },
        { // Second file field configuration.
            name:"coverImage", // The name of the field for the cover image.
            maxCount:1 // The maximum number of files for this field.
        }
    ]),
    registerUser // After the middleware processes the file uploads, the request is passed to the 'registerUser' controller function.
);

// Export the router as the default export of this module, so it can be imported and used in the main application file (e.g., app.js or index.js).
export default router; 