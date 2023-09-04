import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import NotesContext from '../context/notes/notesContext';

export default function EditNote(props) {
    const { id } = useParams();
    const navigate = useNavigate();
    const context = useContext(NotesContext);
    const {notes, getNote, editNote } = context;
    const [note, setNote] = useState({ etitle: '', edescription: '', etag: '' });

    useEffect(() => {
        // Load the specific note based on the ID from the URL params
        getNote();
        // Use find on the notes array from the context
        const selectedNote = notes.find((note) => note._id === id);
    
        if (selectedNote) {
            setNote({
                id: selectedNote._id, // Set the ID to identify the note for editing
                etitle: selectedNote.title,
                edescription: selectedNote.description,
                etag: selectedNote.tag,
            });
        }
        // eslint-disable-next-line
    }, []);

    

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value });
    };

    const handleUpdate = () => {
        editNote(note.id, note.etitle, note.edescription, note.etag);
        navigate('/'); // Navigate back to the home page after updating
        props.showAlert('Updated note Successfuly', 'success')

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
