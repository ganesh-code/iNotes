import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

export default function Login(props) {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    let history = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:5500/api/auth/userlogin', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }), // Sending data in JSON format
        });
        const json = await response.json();
        console.log(json);
        if(json.success){
            //save the authtoken and redirect
            localStorage.setItem('token', json.authtoken)
            history('/')
            props.showAlert('Login Success','success')
        }else{
            props.showAlert(json.error, "danger")
        }
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <div className='container m-5'>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className="form-control" value={credentials.email} onChange={onChange} id="email" name='email' aria-describedby="emailHelp" />
                    <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" value={credentials.password} onChange={onChange} id="password" name='password' />
                    <div id="passwordHelpBlock" className="form-text">
                        Your password must be 8-20 characters long, contain letters and numbers, and must not contain spaces, special characters, or emoji.
                    </div>
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
}
