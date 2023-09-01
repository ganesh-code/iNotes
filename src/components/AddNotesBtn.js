import React from 'react'
import { Link } from 'react-router-dom'

export default function AddNotesBtn() {
    return (
        <div className='m-0 px-5 bg-white' style={{position:'sticky', width:'100%', top:60, zIndex:3}}>
            <Link to='/addnotform' className='navbar-brand p-4 m-0'>
                <div className='d-flex align-items-center justify-content-center p-1 ' style={{ background: 'white', borderRadius: '1rem', border: '2px solid #e5e5e5', cursor: 'pointer', }} >
                    <i className="fa-solid fa-plus fa-xl"></i>
                    <h5 className='p-3 m-0'>Add Note</h5>
                </div>
            </Link>
        </div>
    )
}
