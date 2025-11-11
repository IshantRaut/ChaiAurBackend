// Class definition for ApiResponse. This class is used to create a standardized format
// for API responses, ensuring consistency across all endpoints.
class ApiResponse {
    // The constructor takes three parameters:
    // - statusCode: The HTTP status code of the response (e.g., 200, 400, 500).
    // - data: The data that the API is sending back (can be an object, array, or null).
    // - message: A descriptive message about the result of the API call (defaults to "Success").
    constructor(statusCode, data, message = "Success"){
        // Assign the provided statusCode to the instance's statusCode property.
        this.statusCode = statusCode
        // Assign the provided data to the instance's data property.
        this.data = data
        // Assign the provided message to the instance's message property.
        this.message = message
        // Determine the success status based on the statusCode.
        // If the statusCode is less than 400, the request is considered successful.
        this.success = statusCode < 400
    }
}


// Export the ApiResponse class to make it available for use in other parts of the application.
// This allows you to create consistent API responses throughout your backend.
export { ApiResponse }