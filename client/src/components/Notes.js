import React, { useContext, useEffect } from 'react';
import NotesIteam from './NotesIteam';
import NotesContext from '../context/notes/notesContext';
import AddNotesBtn from './AddNotesBtn';
import { useNavigate } from 'react-router-dom';

export default function Notes(props) {
    // Access the NotesContext to interact with the notes state
    const context = useContext(NotesContext);
    
    // Destructure 'notes' and 'getNote' functions from the context
    const { notes, getNote } = context;
    
    // Use 'useNavigate' to programmatically navigate within the application
    const navigate = useNavigate();

    // Use 'useEffect' to load notes when the component mounts
    useEffect(() => {
        // Check if the user is authenticated by checking for a token in local storage
        const isAuthenticated = localStorage.getItem('token');
        
        if (isAuthenticated) {
            // If authenticated, fetch and load the user's notes
            getNote();
        } else {
            // If not authenticated, redirect to the login page
            navigate('/login');
        }
        // eslint-disable-next-line
    }, []);

    // Function to navigate to the edit page for a specific note
    const updateNote = (currentNote) => {
        navigate(`/edit/${currentNote._id}`);
    };

    return (
        <div>
            <AddNotesBtn theme={props.theme} showAlert={props.showAlert} />
            <div className='col m-0'>
                {Array.isArray(notes) && notes.length > 0 ? (
                    notes.map((note) => (
                        <NotesIteam
                            key={note._id}
                            theme={props.theme}
                            text={props.text}
                            updateNote={updateNote}
                            showAlert={props.showAlert}
                            note={note}
                        />
                    ))
                ) : (
                    <p>No notes available</p>
                )}
            </div>
        </div>
    );
}
