import React, { useContext, useEffect } from 'react';
import NotesIteam from './NotesIteam';
import NotesContext from '../context/notes/notesContext';
import AddNotesBtn from './AddNotesBtn';
import { useNavigate } from 'react-router-dom';

export default function Notes(props) {
    const context = useContext(NotesContext);
    const { notes, getNote } = context;
    const navigate = useNavigate();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('token');
        if (isAuthenticated) {
            getNote();
        } else {
            navigate('/login');
        }
        // eslint-disable-next-line
    }, []);

    const updateNote = (currentNote) => {
        navigate(`/edit/${currentNote._id}`);
    };

    return (
        <div>
            <AddNotesBtn theme={props.theme} showAlert={props.showAlert} />
            <div className='row m-0'>
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
