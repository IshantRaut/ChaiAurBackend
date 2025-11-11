// Import the v2 version of the Cloudinary library and alias it as 'cloudinary'.
import {v2 as cloudinary} from "cloudinary";
// Import the built-in Node.js 'fs' (File System) module.
// This is used to interact with the file system, for example, to delete files.
import fs from "fs";

// Configure the Cloudinary library with your account credentials.
// It's essential to use environment variables for these sensitive details
// to avoid hardcoding them into your source code.
cloudinary.config({
  // Your Cloudinary cloud name.
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  // Your Cloudinary API key.
  api_key: process.env.CLOUDINARY_API_KEY, 
  // Your Cloudinary API secret.
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Define an asynchronous function to handle the file upload process.
// It takes the local path of the file as an argument.
const uploadOnCloudinary= async (localFilePath) => {
    // Use a try-catch block to handle potential errors during the upload process.
    try {
          // If no file path is provided, exit the function and return null.
          if (!localFilePath) return null
        // Upload the file from the local path to Cloudinary.
        const response = await cloudinary.uploader.upload(localFilePath, {
            // 'resource_type: "auto"' tells Cloudinary to automatically detect the type of file (e.g., image, video).
            resource_type: "auto"
        })
        // If the file is uploaded successfully, a response object is returned by Cloudinary.
        // Log the public URL of the uploaded file to the console.
        console.log("file is uploaded on cloudinary ", response.url);
        // After a successful upload, remove the locally saved temporary file.
         fs.unlinkSync(localFilePath)
         // Return the response object from Cloudinary, which contains details like the URL.
         return response;
    } catch (error) {
         // If the upload operation fails, this catch block will execute.
         // It's important to remove the locally saved temporary file to clean up the server.
         fs.unlinkSync(localFilePath) 
        // Return null to indicate that the upload failed.
        return null;
    }
}

// Export the 'uploadOnCloudinary' function to make it available for use in other parts of the application.
export {uploadOnCloudinary}