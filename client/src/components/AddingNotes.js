import React, { useContext, useState } from 'react'
import NotesContext from '../context/notes/notesContext';
import { useNavigate } from 'react-router-dom';

export default function AddNotform(props) {
    // Access the NotesContext to interact with your notes state
    const context = useContext(NotesContext);
    
    // Use useNavigate from react-router-dom for programmatic navigation
    const history = useNavigate();
    
    // Initialize the state for the note using useState
    const [note, setNote] = useState({ title: "", description: "", tag: "default" })

    const { addNote } = context;

    // This function is called when the "Submit" button is clicked
    const handleAdd = (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        
        // Call the addNote function from the context to add a new note
        addNote(note.title, note.description, note.tag);
        
        // Navigate back to the home page ("/") after adding the note
        history('/');
        
        // Call the showAlert function passed as a prop to show a success message
        props.showAlert('Note Added success', 'success')
    }

    // This function is called when any input field in the form changes
    const onChange = (e) => {
        // Update the 'note' state with the new value from the input field
        setNote({ ...note, [e.target.name]: e.target.value })
    }

    // Render the form
    return (
        <form onSubmit={handleAdd} className='container p-5'>
            <div className="mb-3">
                <label htmlFor="title" className="form-label">Title</label>
                <input type="text" name='title' className={`form-control bg-${props.theme} text-${props.text}`} id="title" onChange={onChange} placeholder="title..." required minLength={3} />
            </div>
            <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea className={`form-control bg-${props.theme} text-${props.text}`} name='description' onChange={onChange} id="description" rows="3" required minLength={5}></textarea>
            </div>
            <select className={`form-select mb-5 bg-${props.theme} text-${props.text}`} id='tag' name='tag' onChange={onChange} aria-label="Default select example">
                <option value='tag'>Tag</option>
                <option value="General">General</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
            </select>
            <button type="submit" className="btn btn-primary">Submit</button>
        </form>
    )
}
