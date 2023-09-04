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

//ROUTE 3 : Updating notes 
router.put('/updatenote/:id', fetchuser, async function (req, res) {
    try {
        
    
        const {title, description, tag} = req.body;
        //creating new note object
        let newNote = {};
        if(title){newNote.title = title}
        if(description){newNote.description = description}
        if(tag){newNote.tag = tag}

        //find note to be updated
        let note  = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send('Not found');
        }
        
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send('Not allowed');
        }
        
        note = await Note.findByIdAndUpdate(req.params.id, {$set : newNote}, {new : true} );
        res.json({note})
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
})


//ROUTE 4 : delete notes 
router.delete('/deletenote/:id', fetchuser, async function (req, res) {
    try {
        // const {title, description, tag} = req.body;

        //find note to be updated
        let note  = await Note.findById(req.params.id);
        if(!note){return res.status(404).send('Not found')};

        //allow user id this note belongs to this user 
        if(note.user.toString() !== req.user.id){
            return res.send(401).send('Not allowed')
        }
        note = await Note.findByIdAndDelete(req.params.id);
        res.json({'success': 'successfully deleted note', note: note})
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
})


module.exports = router