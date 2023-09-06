import React, { useContext } from 'react';
import NotesContext from '../context/notes/notesContext';

// This component represents an individual note item displayed in a card format.

export default function NotesIteam(props) {
  // Access the NotesContext to interact with the notes state
  const context = useContext(NotesContext);
  
  // Destructure the 'deleteNote' function from the context
  const { deleteNote } = context;
  
  // Destructure the 'note' and 'updateNote' props from the parent component
  const { note, updateNote } = props;

  return (
    <div className={`col my-3 mx-3 p-0`}>
      <div className={`card m-0 bg-${props.theme} text-${props.text}`}>
        <div className="card-body">
          {/* Display the truncated title of the note */}
          <h5 className="card-title">{note.title}</h5>
          
          {/* Display the truncated description of the note */}
          <p className="card-text">{note.description}</p>
          
          {/* Display the note's tag as a badge */}
          <h6 className="card-subtitle mb-2 text-body-secondary">
            <span className="badge bg-secondary">{note.tag}</span>
          </h6>
          
          {/* Display the date of the note */}
          <p className="card-text">
            <small className={`text-${props.text}`}>{note.date}</small>
          </p>
          
          {/* Button to delete the note */}
          <i
            className="fa-solid fa-trash fa-lg mx-2"
            onClick={() => {
              deleteNote(note._id);
              props.showAlert('Deleted note Successfully', 'success');
            }}
          ></i>
          
          {/* Button to edit the note */}
          <i
            className="fa-solid fa-file-pen fa-lg mx-2"
            onClick={() => {
              updateNote(note);
            }}
          ></i>
        </div>
      </div>
    </div>
  );
}
