// Import necessary modules and dependencies
const express = require('express'); // Express.js for handling routes
const User = require('../models/User'); // Import the User model
const router = express.Router(); // Create an instance of an Express Router
const { body, validationResult } = require('express-validator'); // Import necessary validation functions
const bcrypt = require('bcryptjs'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For creating and verifying JSON Web Tokens
const fetchuser = require('../middleware/fetchuser'); // Custom middleware for fetching user data
const JWT_SECRET = "harryisagoog#@boy"; // Secret key for JWT encryption

// ROUTE 1: Define a route for user registration
router.post('/createuser', [
    // Use express-validator to validate the incoming data for the registration request
    // Validate and sanitize the 'name' field
    body('name', 'Not a valid name').trim().isLength({ min: 3 }),
    // Validate and sanitize the 'email' field
    body('email').trim().notEmpty().isEmail().withMessage('Not a valid e-mail address'),
    // Validate and sanitize the 'password' and 'confPassword' fields
    body('password').trim().isLength({ min: 8 }).withMessage('Password must have at least 8 characters'),
    body('cPassword', 'Passwords do not match').trim().custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords must match');
        }
        return true;
    }),
    
], async (req, res) => {
    const errors = validationResult(req); // Get validation errors from the request
    if (!errors.isEmpty()) {
        // If there are validation errors, return a response with the error details
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: 'You have already registered with this Email' });
        }
        // Create a new user using the User model and the provided data
        const salt = bcrypt.genSaltSync(10);
        const securePass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: securePass,
        });

        // Respond with the created user data
        const data = {
            user: {
                id: user._id,
            },
        };
        const authToken = jwt.sign(data, JWT_SECRET);

        res.json({ authToken });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ROUTE 2: Define a route for user Login
router.post('/userlogin', [
    body('email').trim().notEmpty().isEmail().withMessage('Not a valid e-mail address'),
    body('password', "Password must contain at least 8 characters").trim().isLength({ min: 5 }),
    body('cPassword', 'Passwords do not match').trim().custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords must match');
        }
        return true;
    }),
    
], async (req, res) => {
    let success = false;
    const errors = validationResult(req); // Get validation errors from the request
    if (!errors.isEmpty()) {
        // If there are validation errors, return a response with the error details
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Entered email or password is incorrect, check once and enter again" });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success, error: "Entered email or password is incorrect, check once and enter again" });
        }

        const data = {
            user: {
                id: user._id,
            }
        };
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ROUTE 3: Getting login user details when logged in
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router; // Export the router for use in your application
