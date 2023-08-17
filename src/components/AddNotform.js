import React from 'react'
import { Link } from 'react-router-dom'

export default function AddNotform() {
    return (

        <div className='container p-5'>
            <div className="mb-3">
                <label htmlFor="exampleFormControlInput1" className="form-label">Email address</label>
                <input type="email" className="form-control" id="exampleFormControlInput1" placeholder="name@example.com" />
            </div>
            <div className="mb-3">
                <label htmlFor="exampleFormControlTextarea1" className="form-label">Description</label>
                <textarea className="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
            </div>
            <select className="form-select mb-5" aria-label="Default select example">
                <option value='tag'>Tag</option>
                <option value="General">General</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
            </select>
            <Link to='/' ><button type="submit"  className="btn btn-primary">Submit</button></Link>
        </div>

    )
}