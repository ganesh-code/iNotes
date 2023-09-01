import React, { useState } from 'react';
import NotesContext from './notesContext';

export default function NotesState(props) {
  const host = 'http://localhost:5500'; // The API server's host URL
  const note1 = []; // Initial state for notes
  const [notes, setNotes] = useState(note1); // State to hold notes data

  // Function to retrieve all notes from the API
  const getNote = async () => {
    // Making an API call to fetch all notes
    const response = await fetch(`${host}/api/notes/fetchallnotes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "auth-token":localStorage.getItem('token'),
      },
    });
    const json = await response.json(); // Parsing the response JSON
    setNotes(json); // Updating the state with fetched notes
  }

  // Function to add a new note
  const addNote = async (title, description, tag) => {
    // Making an API call to add a new note
    const response = await fetch(`${host}/api/notes/addnotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem('token')
      },
      body: JSON.stringify({ title, description, tag }), // Sending data in JSON format
    });
    const json = await response.json();
    // Creating a new note object based on the added note
    const note = {
      "_id": "j",
      "user": "64d083effdb28ac961d2949d",
      "title": title,
      "description": description,
      "tag": tag,
      "date": "2023-08-09T06:07:41.825Z",
      "__v": 0
    }
    console.log('Current notes:', notes);
    setNotes(notes.concat(note)); // Adding the new note to the state
  }

  // Function to edit/update a note
  const editNote = async (id, title, description, tag) => {
    // Making an API call to update a specific note
    const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem('token')
      },
      body: JSON.stringify({ title, description, tag }), // Sending updated data
    });
    const json =  await response.json();
    
    // Updating the state to reflect the edited note
    let newNote2 = JSON.parse(JSON.stringify(notes));
    for (let index = 0; index < newNote2.length; index++) {
      const element = newNote2[index];
      if (element._id === id) {
        newNote2[index].title = title;
        newNote2[index].description = description;
        newNote2[index].tag = tag;
        break;
      }
      setNotes(newNote2); // Setting the updated state
    }
  }

  // Function to delete a note
  const deleteNote = async (id) => {
    // Making an API call to delete a specific note
    const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem('token')
      },
    });
    const json = await response.json();
    
    // Updating the state to remove the deleted note
    const newNote = notes.filter((note) => note._id !== id);
    setNotes(newNote);
  }

  // Providing the context with the notes data and functions
  return (
    <NotesContext.Provider value={{ notes, setNotes, addNote, editNote, deleteNote, getNote }}>
      {props.children}
    </NotesContext.Provider>
  );
}
