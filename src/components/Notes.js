import React, { useContext, useEffect, useRef, useState } from 'react'
import NotesIteam from './NotesIteam'
import NotesContext from '../context/notes/notesContext';
import AddNotesBtn from './AddNotesBtn';
import { useNavigate } from 'react-router-dom';

export default function Notes(props) {
    // Get the notes context
    const context = useContext(NotesContext);
    // Destructure necessary functions from the context
    const { notes, getNote, editNote } = context
    // Load notes when the component mounts
    const navigate = useNavigate();
    // Load notes when the component mounts
    useEffect(() => {
        const isAuthenticated = localStorage.getItem('token');
        if (isAuthenticated) {
            getNote();
        } else {
            navigate('/login');
        }
        // eslint-disable-next-line
    }, [])

    // Destructure addNote function from the context
    const { addNote } = context
    // Refs for interacting with the modal
    const ref = useRef(null)
    const refClose = useRef(null)
    // State for holding note data
    const [note, setNote] = useState({ id: '', etitle: '', edescription: '', etag: '' })

    // Update note state when input values change
    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value })
    }



    // Open the modal and populate it with current note data
    const updateNote = (currentNote) => {
        ref.current.click();
        setNote({ id: currentNote._id, etitle: currentNote.title, edescription: currentNote.description, etag: currentNote.tag })
    }

    // Handle the update of the note
    const handleAdd = (e) => {
        editNote(note.id, note.etitle, note.edescription, note.etag)
        refClose.current.click();
        props.showAlert('Updated note Successfuly', 'success')
    }

    return (
        <div>
            <AddNotesBtn theme={props.theme} showAlert={props.showAlert} />
            <button style={{ position: 'absolute', display: 'none' }} ref={ref} type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Launch demo modal
            </button>
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className={`modal-content bg-${props.theme}`}>
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Update Notes</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Title</label>
                                    <input type="text" name='etitle' value={note.etitle} className={`form-select mb-5 bg-${props.theme} text-${props.text}`} id="etitle" onChange={onChange} placeholder="title..." />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea className={`form-select mb-5 bg-${props.theme} text-${props.text}`} value={note.edescription} name='edescription' onChange={onChange} id="edescription" rows="3"></textarea>
                                </div>
                                <select className={`form-select mb-5 bg-${props.theme} text-${props.text}`} id='etag' name='etag' value={note.etag} onChange={onChange} aria-label="Default select example">
                                    <option value=''>Tag</option>
                                    <option value="General">General</option>
                                    <option value="Education">Education</option>
                                    <option value="Entertainment">Entertainment</option>
                                </select>

                            </form>
                        </div>
                        <div className="modal-footer">
                            {/* Button to close the modal */}
                            <button ref={refClose} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            {/* Button to trigger the update of the note */}
                            <button onClick={handleAdd} type="button" className="btn btn-primary">Update</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='row m-0'>
                {/* Display list of notes */}
                {Array.isArray(notes) && notes.length > 0 ? (
                    notes.map((note) => (
                        <NotesIteam key={note._id} theme={props.theme} text={props.text} updateNote={updateNote} showAlert={props.showAlert} note={note} />
                    ))
                ) : (
                    <p>No notes available</p>
                )}
            </div>

        </div>
    )
}