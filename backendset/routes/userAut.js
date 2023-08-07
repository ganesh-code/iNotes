const express = require('express')
const User = require('../models/User'); // Import the User model
const router = express.Router();
const { body, validationResult } = require('express-validator'); // Import necessary validation functions
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "harryisagoog#@boy"

// Define a route for user registration
router.post('/createuser',[
    // Use express-validator to validate the incoming data for the registration request
    // Validate and sanitize the 'name' field
    body('name', "not a valid name").trim().notEmpty().isLength({ min: 3 }),
    // Validate and sanitize the 'email' field
    body('email').trim().notEmpty().isEmail().withMessage('Not a valid e-mail address'),
    // Validate and sanitize the 'password' field
    // Validate and sanitize the 'password' field
    body('password').trim().notEmpty().isLength({ min: 8 }).withMessage('Password must have at least 8 Characters'),

], async (req, res) => {
    const errors = validationResult(req); // Get validation errors from the request
    if (!errors.isEmpty()) {
        // If there are validation errors, return a response with the error details
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let user = await User.findOne({email: req.body.email})
        if(user){
            return res.status(400).json({error : "You have already rigisterd with this Email"})
        }
        // Create a new user using the User model and the provided data
        const salt = bcrypt.genSaltSync(10);
        // var hash = bcrypt.hashSync("B4c0/\/", salt);
        const securePass = await bcrypt.hash(req.body.password, salt )
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: securePass
        });

        // Respond with the created user data
        const data = {
           user: {
                id: user._id,
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)
        // console.log(authToken)

        res.json({authToken});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
    
});

module.exports = router; // Export the router for use in your application
