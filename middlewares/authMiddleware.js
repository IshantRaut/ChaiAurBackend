// Import the ApiError class from the utils directory. This class is used for creating custom error objects.
import { ApiError } from "../utils/ApiError.js";
// Import the asyncHandler function from the utils directory. This function is used to wrap asynchronous functions to handle errors properly.
import { asyncHandler } from "../utils/asyncHandler.js";
// Import the jsonwebtoken library for verifying and decoding JWTs.
import jwt from "jsonwebtoken";
// Import the User model from the models directory. This model is used to query the database for user information.
import { User } from "../models/user.model.js";

// Define the verifyJWT middleware function. It takes req, res, and next as parameters.
export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Extract the JWT from the request cookies or the Authorization header.
    const token =
      req.cookies.accessToken || // Attempt to get the token from the 'accessToken' cookie.
      req.header("Authorization")?.replace("Bearer ", ""); // If not in cookies, get the 'Authorization' header and remove 'Bearer ' prefix.
 console.log(token);

    // Check if the token exists.
    if (!token || token === undefined) {
      // If the token is missing, throw an ApiError with a 401 status code (Unauthorized).
      throw new ApiError(401, "Unauthorized");
    }

    // Verify the token using the jwt.verify method.
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // Find the user in the database using the decoded user ID from the token.
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken" // Exclude the password and refreshToken fields from the result for security reasons.
    );

      if (!user) {
            // NEXT_VIDEO: discuss about frontend
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
  } catch (error) {
       throw new ApiError(401, error?.message || "Invalid access token")
  }
});