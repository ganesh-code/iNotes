import React from 'react'

export default function NotesIteam(props) {
  const {note}= props;
  return (
    <div className="card m-3 d-flex flex-wrap" style={{width:"19rem"}}>
      <div className="card-body">
        <h5 className="card-title">{note.title}</h5>
        <p className="card-text">{note.description}</p>
        <h6 className="card-subtitle mb-2 text-body-secondary"><span className="badge bg-secondary">{note.tag}</span></h6>
        <p className="card-text"><small className="text-body-secondary">{note.date}</small></p>
      </div>
    </div>
  )
}