import React from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar(props) {
    let location = useLocation();
    let navigate = useNavigate();
    const handleLogout =()=>{
        localStorage.removeItem('token');
        navigate('/login')
    }

    return (
        <nav className={`navbar navbar-expand-lg bg-${props.theme} fixed-top`} data-bs-theme={`${props.theme}`} style={{position:'sticky', top:0, zIndex:3}}>
            <div className="container-fluid">
                <Link className="navbar-brand" to="/"><img className='mx-4' style={{ width: "40px" }} src="./notesicon.png" alt="" />iNotes</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <button className='mx-4 my-1 position-absolute' onClick={props.toogleTheme} style={{border:"0", background:"none", right:"12%", top:'18px'}}><i className={`fa-solid fa-${props.icon} fa-2xl`}></i></button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} aria-current="page" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === "/about" ? "active" : ""}`} to="/about">About</Link>
                        </li>
                    </ul>
                    {!localStorage.getItem('token')?<form className="d-flex" role="search">
                        <Link className="btn btn-outline-primary mx-2" to='/login' type="button">Login</Link>
                        <Link className="btn btn-primary mx-2" to='/signup' type="button">Signup</Link>
                    </form>: <button onClick={handleLogout} className='btn btn-primary'>Logout</button>}
                </div>
            </div>
        </nav>
    )
}
