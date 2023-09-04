// Import necessary packages and modules
const express = require('express');
const router = express.Router(); // Create a router instance
const Note = require('../models/Notes'); // Import the 'Note' model
const { body, validationResult } = require('express-validator'); // Import necessary validation functions
const fetchuser = require('../middleware/fetchuser'); // Import custom middleware for user authentication

// ROUTE 1: Getting notes of the respective user
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        // Fetch all notes belonging to the authenticated user
        const notes = await Note.find({ user: req.user.id });
        res.json(notes); // Respond with the fetched notes in JSON format
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" }); // Respond with a 500 status code if there's an error
    }
});

// ROUTE 2: Adding notes
router.post('/addnotes', fetchuser, [
    // Validate and sanitize the 'title' field
    body('title', "not a valid title").trim().isLength({ min: 3 }),
    // Validate and sanitize the 'description' field
    body('description').trim().isLength({ min: 8 }).withMessage('Description must have at least 8 characters'),
], async function (req, res) {
    try {
        const { title, description, tag } = req.body;
        const errors = validationResult(req); // Get validation errors from the request

        if (!errors.isEmpty()) {
            // If there are validation errors, return a response with the error details
            return res.status(400).json({ errors: errors.array() });
        }

        // Create a new 'Note' object with data from the request and the authenticated user's ID
        const notes = new Note({
            title, description, tag, user: req.user.id
        });

        // Save the new note to the database
        const savedNotes = await notes.save();

        res.json(savedNotes); // Respond with the saved note in JSON format
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" }); // Respond with a 500 status code if there's an error
    }
});

// ROUTE 3: Updating notes
router.put('/updatenote/:id', fetchuser, async function (req, res) {
    try {
        const { title, description, tag } = req.body;
        
        // Create a new 'Note' object with updated data
        let newNote = {};
        if (title) { newNote.title = title }
        if (description) { newNote.description = description }
        if (tag) { newNote.tag = tag }

        // Find the note to be updated by its ID
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send('Not found');
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send('Not allowed');
        }

        // Update the note and return the updated note
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" }); // Respond with a 500 status code if there's an error
    }
});

// ROUTE 4: Delete notes
router.delete('/deletenote/:id', fetchuser, async function (req, res) {
    try {
        // Find the note to be deleted by its ID
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send('Not found');
        }

        // Allow deletion only if the note belongs to the authenticated user
        if (note.user.toString() !== req.user.id) {
            return res.send(401).send('Not allowed');
        }

        // Delete the note and respond with a success message
        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ 'success': 'successfully deleted note', note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" }); // Respond with a 500 status code if there's an error
    }
});

module.exports = router; // Export the router for use in other parts of the application
