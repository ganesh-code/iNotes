import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import NotesContext from '../context/notes/notesContext';

export default function EditNote(props) {
    const { id } = useParams();
    const context = useContext(NotesContext);
    const { notes, getNote, addNote, editNote } = context;
    const [note, setNote] = useState({ etitle: '', edescription: '', etag: '' });

    useEffect(() => {
        // If an 'id' is provided, fetch the note for editing
        if (id) {
            getNote();
            const selectedNote = notes.find((note) => note._id === id);
            if (selectedNote) {
                setNote({
                    etitle: selectedNote.title,
                    edescription: selectedNote.description,
                    etag: selectedNote.tag,
                });
            }
        }
        // eslint-disable-next-line
    }, [id, notes]);

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        if (id) {
            // If 'id' is present, edit the note
            editNote(id, note.etitle, note.edescription, note.etag);
            props.showAlert('Updated note successfully', 'success');
        } else {
            // If 'id' is not present, add a new note
            addNote(note.etitle, note.edescription, note.etag);
            props.showAlert('Added a new note successfully', 'success');
        }
    };

    return (
        <div className="container">
            <h1>{id ? 'Edit Note' : 'Add New Note'}</h1>
            <div className="mb-3">
                <label htmlFor="etitle" className="form-label">Title</label>
                <input
                    type="text"
                    name="etitle"
                    value={note.etitle}
                    className={`form-control`}
                    id="etitle"
                    onChange={onChange}
                    placeholder="Title..."
                />
            </div>
            <div className="mb-3">
                <label htmlFor="edescription" className="form-label">Description</label>
                <textarea
                    className={`form-control`}
                    value={note.edescription}
                    name="edescription"
                    onChange={onChange}
                    id="edescription"
                    rows="3"
                ></textarea>
            </div>
            <select
                className={`form-select mb-5`}
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

            <button onClick={handleSave} type="button" className="btn btn-primary">
                {id ? 'Update' : 'Add'}
            </button>

            {/* Add a button to navigate back to the home page */}
            <Link to="/" className="btn btn-secondary mt-3">Back to Home</Link>
        </div>
    );
}
