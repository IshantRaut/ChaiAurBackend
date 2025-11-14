// Import the asyncHandler utility to wrap async functions and handle errors.
import {asyncHandler} from "../utils/asyncHandler.js";
// Import the ApiError utility for creating standardized API error responses.
import {ApiError} from "../utils/ApiError.js"
// Import the User model to interact with the users collection in the database.
import {User} from "../models/user.model.js";
// Import the function to upload files to Cloudinary.
import {uploadOnCloudinary} from "../middlewares/cloudinary.js";
// Import the ApiResponse utility for creating standardized API success responses.
import {ApiResponse} from "../utils/ApiResponse.js";
//Import Json Web Token
import jwt from "jsonwebtoken";
// A helper function to generate new access and refresh tokens for a given user.
const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        // Find the user in the database by their unique ID.
        const user = await User.findById(userId);
        // Generate a new access token using the method defined on the user model.
        const accessToken = user.generateAccessToken();
        // Generate a new refresh token using the method defined on the user model.
        const refreshToken = user.generateRefreshToken();
        
        // Store the newly generated refresh token in the user's record in the database.
        user.refreshToken = refreshToken
        // Save the updated user document. We disable validation because we are only updating the token, not other fields.
        await user.save({ validateBeforeSave: false })

        // Return the newly generated tokens.
        return {accessToken, refreshToken}
    } catch (error) {
        // If any error occurs during token generation, throw a server error.
           throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const  incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request");
    }

    try {
         const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    const user = await User.findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401,"Invalid refresh Token")
    }
     if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
         return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
            throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})


// Controller function for handling user registration. Wrapped in asyncHandler for error handling.
const registerUser = asyncHandler( async (req, res) => {
   // Destructure user details from the request body.
   const {fullName,email,username,password} = req.body;

    // Validate that none of the required fields are empty.
    if(
        [fullName,email,username,password].some((field) =>field.trim()=== "")
    ){
        // If any field is empty, throw a 400 Bad Request error.
        throw new ApiError(400, "All fields are required")
    }
    // Check if a user with the same username or email already exists in the database.
    const existedUser = await User.findOne({
        $or:[{username},{email}] // Use $or to check for either condition.
    })
    if(existedUser){
        // If a user already exists, throw a 409 Conflict error.
        throw new ApiError(409, "User with email or username already exists")
    }

    // Get the local path of the uploaded avatar file from the request. `req.files` is populated by multer.
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    // Check if a cover image was uploaded and get its local path.
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // Validate that an avatar file was provided.
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }
    // Upload the avatar from the local path to Cloudinary.
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // Upload the cover image (if it exists) to Cloudinary.
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // Check if the avatar upload to Cloudinary was successful.
    if(!avatar){
        throw new ApiError(400, "Avatar file upload failed")
    }
    // Create a new user document in the database with the provided details.
    const user = await User.create({
        fullName,
        avatar: avatar.url, // Store the URL of the uploaded avatar from Cloudinary.
        coverImage: coverImage?.url || "", // Store the cover image URL, or an empty string if it wasn't uploaded.
        email,
        password, // The password will be hashed automatically by the pre-save hook in the User model.
        username: username.toLowerCase() // Store the username in lowercase for consistency.
    })
    // Retrieve the newly created user from the database but exclude the password and refreshToken fields for security.
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // Verify that the user was successfully created.
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    // Send a success response with the created user's data.
    return res.status(201).json( // 201 Created status code.
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
} )

// Controller function for handling user login.
const loginUser = asyncHandler(async (req,res)=>{
    // Destructure email, username, and password from the request body.
    const {email,username,password} = req.body;
    // Validate that either a username or an email was provided.
    if(!username && !email){
        throw new ApiError(400, "Username or email is required")
    }
    // Find the user in the database by their username or email.
    const user = await User.findOne({
        $or:[{username},{email}]
    })
    // If no user is found, throw a 404 Not Found error.
    if(!user){
        throw new ApiError(404, "User not found")
    }
    // Check if the provided password is correct by comparing it with the hashed password in the database.
    const isPasswordValid = await user.isPasswordCorrect(password); // This is a custom method on the User model.
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials") // 401 Unauthorized.
    }

    // If the password is valid, generate new access and refresh tokens.
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id);
    // Get the logged-in user's data, excluding sensitive fields.
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // Define options for the cookies that will be sent to the client.
    const options={
        httpOnly:true, // The cookie cannot be accessed by client-side scripts.
        secure:true // The cookie will only be sent over HTTPS.
    }
    // Send the response with the tokens in secure cookies and user data in the JSON body.
    return res
    .status(200) // 200 OK status.
    .cookie("accessToken", accessToken, options) // Set the access token in a cookie.
    .cookie("refreshToken", refreshToken, options) // Set the refresh token in a cookie.
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

// Controller function for handling user logout.
const logoutUser = asyncHandler(async(req, res) => {
    // Find the user by their ID (which was added to the request object by the `verifyJWT` middleware) and update their document.
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { // Use $set to update a specific field.
                refreshToken: undefined // Invalidate the refresh token by removing it from the database.
            }
        },
        {
            new: true // Return the updated document (optional here as we don't use the result).
        }
    )

    // Define cookie options for clearing them.
    const options = {
        httpOnly: true,
        secure: true
    }

    // Send a response that clears the client's cookies.
    return res
    .status(200)
    .clearCookie("accessToken", options) // Clear the access token cookie.
    .clearCookie("refreshToken", options) // Clear the refresh token cookie.
    .json(new ApiResponse(200, {}, "User logged Out Successfully"))
})

// Export the controller functions to be used in the user routes file.
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}