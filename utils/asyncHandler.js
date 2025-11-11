// This is a higher-order function. It takes a function `requestHandler` as an argument.
// The purpose of this wrapper is to handle asynchronous operations in Express route handlers
// without needing to write a try-catch block in every single one.
const asyncHandler = (requestHandler) => {
    // It returns a new function that will be used as the actual Express middleware.
    // This function receives the standard (req, res, next) arguments from Express.
    return (req, res, next) => {
        // We wrap the execution of the original `requestHandler` in `Promise.resolve`.
        // This ensures that if `requestHandler` is an async function, its returned promise is handled.
        // If it's a synchronous function, its return value is wrapped in a resolved promise.
        Promise.resolve(requestHandler(req, res, next))
            // If the promise is rejected (meaning an error occurred in the async function),
            // the .catch() block will be executed.
            .catch((err) => next(err)); // The error is passed to Express's next error-handling middleware.
    };
}

// Export the `asyncHandler` so it can be used to wrap controller functions throughout the application.
export { asyncHandler };