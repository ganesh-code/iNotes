import React, { useState } from 'react'
import NotesContext from './notesContext'

export default function NotesState(props) {
  const note1 = [
    {
      "_id": "64d213d1e510c38dbfa12ffb",
      "user": "64d083effdb28ac961d2949d",
      "title": "react learnings",
      "description": "this is a wonderful react class",
      "tag": "details",
      "date": "2023-08-08T10:07:13.884Z",
      "__v": 0
    },
    {
      "_id": "64d32d2d7728e12a16b49d35",
      "user": "64d083effdb28ac961d2949d",
      "title": "react learnings",
      "description": "this is a wonderful react class",
      "tag": "generals",
      "date": "2023-08-09T06:07:41.825Z",
      "__v": 0
    },
    {
      "_id": "64d32d2d7728e12a16b49d35",
      "user": "64d083effdb28ac961d2949d",
      "title": "react learnings",
      "description": "this is a wonderful react class",
      "tag": "generals",
      "date": "2023-08-09T06:07:41.825Z",
      "__v": 0
    },
    {
      "_id": "64d32d2d7728e12a16b49d35",
      "user": "64d083effdb28ac961d2949d",
      "title": "react learnings",
      "description": "this is a wonderful react class",
      "tag": "generals",
      "date": "2023-08-09T06:07:41.825Z",
      "__v": 0
    },
    {
      "_id": "64d32d2d7728e12a16b49d35",
      "user": "64d083effdb28ac961d2949d",
      "title": "react learnings",
      "description": "this is a wonderful react class",
      "tag": "generals",
      "date": "2023-08-09T06:07:41.825Z",
      "__v": 0
    },
    {
      "_id": "64d32d2d7728e12a16b49d35",
      "user": "64d083effdb28ac961d2949d",
      "title": "react learnings",
      "description": "this is a wonderful react class",
      "tag": "generals",
      "date": "2023-08-09T06:07:41.825Z",
      "__v": 0
    },
    {
      "_id": "64d32d2d7728e12a16b49d35",
      "user": "64d083effdb28ac961d2949d",
      "title": "react learnings",
      "description": "this is a wonderful react class",
      "tag": "generals",
      "date": "2023-08-09T06:07:41.825Z",
      "__v": 0
    },
    {
      "_id": "64d32d2d7728e12a16b49d35",
      "user": "64d083effdb28ac961d2949d",
      "title": "react learnings",
      "description": "this is a wonderful react class",
      "tag": "generals",
      "date": "2023-08-09T06:07:41.825Z",
      "__v": 0
    },
    {
      "_id": "64d32d2d7728e12a16b49d35",
      "user": "64d083effdb28ac961d2949d",
      "title": "react learnings",
      "description": "this is a wonderful react class",
      "tag": "generals",
      "date": "2023-08-09T06:07:41.825Z",
      "__v": 0
    },
  ]

  const [notes, setNotes] = useState(note1)

  return (
    <NotesContext.Provider value={{notes, setNotes}}>
      {props.children}
    </NotesContext.Provider>
  )
}
