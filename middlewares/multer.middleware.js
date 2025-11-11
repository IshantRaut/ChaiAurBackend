// Import the 'multer' library, which is a middleware for handling multipart/form-data, primarily used for uploading files.
import multer from "multer";

// Configure the storage engine for multer. 'diskStorage' gives you full control over storing files to disk.
const storage = multer.diskStorage({
    // 'destination' is a function that determines the folder where uploaded files will be stored.
    destination: function (req, file, cb) {
      // The first argument to the callback (cb) is for an error (null in this case).
      // The second argument is the destination path. Here, files are saved to a temporary folder inside the 'public' directory.
      cb(null, "./public/temp")
    },
    // 'filename' is a function that determines the name of the file inside the destination folder.
    filename: function (req, file, cb) {
      
      // The first argument to the callback is for an error (null).
      // The second argument is the filename. Here, we are keeping the original name of the uploaded file.
      cb(null, file.originalname)
    }
  })
  
// Export the configured multer instance as 'upload'.
export const upload = multer({
    // Pass the storage configuration to multer.
    storage,
})