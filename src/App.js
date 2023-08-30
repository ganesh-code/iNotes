import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import AddingNotes from './components/AddingNotes';
import NotesState from './context/notes/NotesState';
import Alert from './components/Alert';
import Login from './components/Login';
import Signup from './components/Signup';

  function App() {
    const [alert , setAlert] = useState(null)
    const showAlert = (message, type)=>{
      setAlert({
        msg : message,
        type:type
      })
      setTimeout(()=>{
        setAlert(null)
      }, 1500)
    }
    return (
      <>
        <BrowserRouter>
          <NotesState> 
          <Navbar />
          <Alert alert={alert}/>
            <Routes>
              <Route exact path='/' element={<Home showAlert={showAlert} />} />
              <Route exact path='/about' element={<About />} />
              <Route exact path='/addnotform' element={<AddingNotes showAlert={showAlert}/>} />
              <Route exact path='/login' element={<Login showAlert={showAlert}/>} />
              <Route exact path='/signup' element={<Signup showAlert={showAlert}/>} />
            </Routes>
            </NotesState>
        </BrowserRouter>
      </>
    );
  }

export default App;
