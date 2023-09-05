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
import EditNote from './components/EditNotes';
import Error from './components/Error';

function App() {
  const [alert, setAlert] = useState(null)
  const showAlert = (message, type) => {
    setAlert({
      msg: message,
      type: type
    })
    setTimeout(() => {
      setAlert(null)
    }, 1500)
  }

  const [theme, setTheme] = useState("light");
  const [icon, setIcon] = useState("moon");
  const [text, setText] = useState("dark")

  const toogleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      setIcon("sun");
      setText("light")
      document.body.style.backgroundColor = '#181a1c';
      document.body.style.color = 'white';
    } else {
      setTheme("light")
      setIcon("moon");
      setText("dark")
      document.body.style.backgroundColor = 'white';
      document.body.style.color = 'black';

    }
  }

  return (
    <>
      <BrowserRouter>
        <NotesState>
          <Navbar theme={theme} icon={icon} toogleTheme={toogleTheme} />
          <Alert alert={alert} />
          <Routes>
            <Route exact path='/' element={<Home theme={theme} text={text} showAlert={showAlert} />} />
            <Route exact path='/about' element={<About theme={theme} text={text} />} />
            <Route exact path='/addnotform' element={<AddingNotes theme={theme} text={text} showAlert={showAlert} />} />
            <Route exact path='/login' element={<Login theme={theme} text={text} showAlert={showAlert} />} />
            <Route exact path='/signup' element={<Signup theme={theme} text={text} showAlert={showAlert} />} />
            <Route path="/edit/:id" element={<EditNote  theme={theme} text={text} showAlert={showAlert}/>} />
            <Route path='*' element={<Error/>}/>
          </Routes>
        </NotesState>
      </BrowserRouter>
    </>
  );
}

export default App;
