import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import AddingNotes from './components/AddingNotes';
import NotesState from './context/notes/NotesState';
import Alert from './components/Alert';

  function App() {
    return (
      <>
        <BrowserRouter>
          <NotesState> 
          <Navbar />
          <Alert message='this is amazing'/>
            <Routes>
              <Route exact path='/' element={<Home />} />
              <Route exact path='/about' element={<About />} />
              <Route exact path='/addnotform' element={<AddingNotes/>} />
            </Routes>
            </NotesState>
        </BrowserRouter>
      </>
    );
  }

export default App;
