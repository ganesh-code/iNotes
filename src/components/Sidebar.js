import React, { useContext } from 'react'
// import { Link } from 'react-router-dom' 
import NotesIteam from './NotesIteam'
import NotesContext from '../context/notes/notesContext';
import AddNotesBtn from './AddNotesBtn';

export default function Sidebar(props) {
    const context = useContext(NotesContext);
    // eslint-disable-next-line
    const { notes, setNotes } = context
    
    
    return (
        <div>
           <AddNotesBtn/>
            <div className='m-0 p-5 row g-md-3'>
                {notes.map((note) => {
                    return <NotesIteam key={note.date} note={note} />;
                })}
            </div>
        </div>
    )
}