const jwt = require('jsonwebtoken');
const JWT_SECRET = "harryisagoog#@boy"

// Middleware function to fetch user details from a JWT token
const fetchuser = (req, res, next) => {
    // Get the user from the JWT token and append it to the 'req' object

    // Extract the JWT token from the 'auth-token' header
    const token = req.header('auth-token');

    // Check if a token is provided in the request header
    if (!token) {
        // If no token is provided, return a 401 Unauthorized response
        res.status(401).send({ error: 'Please authenticate with a valid token' });
    }

    try {
        // Verify the JWT token using the secret key (JWT_SECRET)
        const data = jwt.verify(token, JWT_SECRET);

        // If the token is valid, extract the user information from the token
        req.user = data.user;

        // Continue processing the request by calling the 'next' middleware or route handler
        next();
    } catch (error) {
        // If an error occurs during token verification (e.g., invalid or expired token),
        // log the error and return a 401 Unauthorized response
        console.log(error.message);
        res.status(401).send({ error: 'Please authenticate with a valid token' });
    }
}

module.exports = fetchuser;
