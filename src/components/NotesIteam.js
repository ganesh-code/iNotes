import React, { useContext } from 'react';
import NotesContext from '../context/notes/notesContext';




export default function NotesIteam(props) {
  const context = useContext(NotesContext)
  const { deleteNote } = context
  const { note, updateNote }= props;
  return (
    <div className="card m-3 d-flex flex-wrap" style={{width:"18rem"}}>
      <div className="card-body">
        <h5 className="card-title">{note.title.slice(0,20)}</h5>
        <p className="card-text">{note.description.slice(0,30)}</p>
        <h6 className="card-subtitle mb-2 text-body-secondary"><span className="badge bg-secondary">{note.tag}</span></h6>
        <p className="card-text"><small className="text-body-secondary">{note.date}</small></p>
        <i className="fa-solid fa-trash fa-lg mx-2" onClick={()=>{deleteNote(note._id)}}></i>
        <i className="fa-solid fa-file-pen fa-lg mx-2" onClick={()=>{updateNote(note)}} ></i>
      </div>
    </div>
  )
}