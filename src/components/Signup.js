import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

export default function Login(props) {
    const [credentials, setCredentials] = useState({name:'', email: '', password: '', confPassword:'' });
    let history = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:5500/api/auth/createuser', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name:credentials.name, email: credentials.email, password: credentials.password }), // Sending data in JSON format
        });
        const json = await response.json();
        console.log(json);
        if(json.success){
            //save the authtoken and redirect
            localStorage.setItem('token', json.authtoken)
            history('/')
            props.showAlert('Account Created Successfuly', "success")
        }else{
            props.showAlert(json.error, "danger")
        }
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };
    return (
        <div className='container'>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" name='name' className="form-control" onChange={onChange} id="name" aria-describedby="emailHelp" required/>
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" name='email' className="form-control" onChange={onChange} id="email" aria-describedby="emailHelp" required/>
                        <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" name='password' className="form-control" onChange={onChange} id="password" required minLength={8}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="confPassword" className="form-label">Confirm Password</label>
                    <input type="password" name='confPassword' className="form-control" onChange={onChange} id="confPassword" required minLength={8}/>
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    )
}
