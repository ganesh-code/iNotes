const express = require('express');
const router = express.Router();
const Note = require('../models/Notes')
const { body, validationResult } = require('express-validator'); // Import necessary validation functions
const fetchuser = require('../middleware/fetchuser')


//ROUTE:1 getting notes of respected user
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
})

//ROUTE 2 : Adding notes 
router.post('/addnotes', fetchuser, [
    // Validate and sanitize the 'title' field
    body('title', "not a valid title").trim().isLength({ min: 3 }),
    // Validate and sanitize the 'discription' field
    body('description').trim().isLength({ min: 8 }).withMessage('Discription must have at least 8 Characters'),

], async function (req, res) {
    try {
        const { title, description, tag } = req.body;
        const errors = validationResult(req); // Get validation errors from the request
        if (!errors.isEmpty()) {
            // If there are validation errors, return a response with the error details
            return res.status(400).json({ errors: errors.array() });
        }

        const notes = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNotes = await notes.save();
        res.json(savedNotes)
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
})




module.exports = router