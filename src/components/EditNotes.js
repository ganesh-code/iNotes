import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import NotesContext from '../context/notes/notesContext';

export default function EditNote(props) {
    // Get the 'id' parameter from the URL using the 'useParams' hook
    const { id } = useParams();
    
    // Use 'useNavigate' to programmatically navigate between routes
    const navigate = useNavigate();
    
    // Access the NotesContext to interact with the notes state
    const context = useContext(NotesContext);
    
    // Destructure 'notes', 'getNote', and 'editNote' functions from the context
    const { notes, getNote, editNote } = context;
    
    // Initialize state for the note being edited using 'useState'
    const [note, setNote] = useState({ etitle: '', edescription: '', etag: '' });

    // Use 'useEffect' to load the specific note when the component mounts
    useEffect(() => {
        // Call 'getNote' from the context to load notes
        getNote();
        
        // Use 'find' to locate the specific note in the 'notes' array based on 'id'
        const selectedNote = notes.find((note) => note._id === id);
    
        if (selectedNote) {
            // Update the 'note' state with the details of the selected note
            setNote({
                id: selectedNote._id, // Set the ID to identify the note for editing
                etitle: selectedNote.title,
                edescription: selectedNote.description,
                etag: selectedNote.tag,
            });
        }
        // eslint-disable-next-line
    }, []);

    // Function to handle input field changes and update 'note' state
    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value });
    };

    // Function to handle the update of the edited note
    const handleUpdate = () => {
        // Call 'editNote' from the context with updated note details
        editNote(note.id, note.etitle, note.edescription, note.etag);
        
        // Navigate back to the home page after updating
        navigate('/');
        
        // Show a success alert using the 'props' passed to the component
        props.showAlert('Updated note Successfully', 'success')
    };

    return (
        <div className="container">
            <h1 className='mt-5'>Edit Note</h1>
            <div className="mb-3">
                <label htmlFor="etitle" className="form-label">Title</label>
                <input
                    type="text"
                    name="etitle"
                    value={note.etitle}
                    className={`form-control bg-${props.theme} text-${props.text}`}
                    id="etitle"
                    onChange={onChange}
                    placeholder="Title..."
                />
            </div>
            <div className="mb-3">
                <label htmlFor="edescription" className="form-label">Description</label>
                <textarea
                    className={`form-control bg-${props.theme} text-${props.text}`}
                    value={note.edescription}
                    name="edescription"
                    onChange={onChange}
                    id="edescription"
                    rows="3"
                ></textarea>
            </div>
            <select
                className={`form-select mb-5 bg-${props.theme} text-${props.text}`}
                id="etag"
                name="etag"
                value={note.etag}
                onChange={onChange}
                aria-label="Default select example"
            >
                <option value=''>Tag</option>
                <option value="General">General</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
            </select>

            <button onClick={handleUpdate} type="button" className="btn btn-primary mx-2">Update</button>

            {/* Add a button to navigate back to the home page */}
            <Link to="/" className="btn btn-secondary mx-3">Back to Home</Link>
        </div>
    );
}
