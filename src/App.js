import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import AddNotform from './components/AddNotform';
import NotesState from './context/notes/NotesState';

  function App() {
    return (
      <>
        <BrowserRouter>
          <NotesState> 
          <Navbar />
            <Routes>
              <Route exact path='/' element={<Home />} />
              <Route exact path='/about' element={<About />} />
              <Route exact path='/addnotform' element={<AddNotform/>} />
            </Routes>
            </NotesState>
        </BrowserRouter>
      </>
    );
  }

export default App;
