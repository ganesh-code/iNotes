import React, { useContext } from 'react';
import NotesContext from '../context/notes/notesContext';


// style={{maxWidth: "18rem"}}

export default function NotesIteam(props) {
  const context = useContext(NotesContext)
  const { deleteNote } = context
  const { note, updateNote } = props;
  return (
    <div className={`col my-3 mx-3 p-0`}>
      <div class={`card m-0 bg-${props.theme} text-${props.text}`}>
        <div className="card-body">
          <h5 className="card-title">{note.title.slice(0, 15)}</h5>
          <p className="card-text">{note.description.slice(0, 25)}</p>
          <h6 className="card-subtitle mb-2 text-body-secondary"><span className="badge bg-secondary">{note.tag}</span></h6>
          <p className="card-text"><small className={`text-${props.text}`}>{note.date}</small></p>
          <i className="fa-solid fa-trash fa-lg mx-2" onClick={() => { deleteNote(note._id); props.showAlert('Deleted note Successfuly', 'success') }}></i>
          <i className="fa-solid fa-file-pen fa-lg mx-2" onClick={() => { updateNote(note) }} ></i>
        </div>
      </div>
    </div>
  )
}