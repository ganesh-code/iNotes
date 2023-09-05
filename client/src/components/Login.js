import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

export default function Login(props) {
    // Use 'useState' to manage the visibility of the password input
    const [showPassword, setShowPassword] = useState(false);
    
    // Use 'useState' to manage the form input values
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    
    // Use 'useNavigate' for programmatic navigation within the application
    let history = useNavigate();

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        
        // Send a POST request to the server for user login
        const response = await fetch('http://localhost:5500/api/auth/userlogin', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }), // Sending data in JSON format
        });
        
        const json = await response.json(); // Parse the JSON response
        
        if (json.success) {
            // Save the authentication token to local storage and redirect to the home page
            localStorage.setItem('token', json.authToken);
            props.showAlert('Login Success', 'success'); // Show a success alert
            history('/'); // Navigate to the home page
        } else {
            props.showAlert(json.error, "danger"); // Show an error alert if login fails
        }
    };

    // Function to handle changes in form input fields
    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <div className='container p-5'>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className={`form-control bg-${props.theme} text-${props.text}`} value={credentials.email} onChange={onChange} id="email" name='email' aria-describedby="emailHelp" />
                    <div id="emailHelp" className={`form-text text-${props.text}`}>We'll never share your email with anyone else.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label" >
                        Password
                    </label>
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"} // Toggle password visibility
                            name="password"
                            className={`form-control bg-${props.theme} text-${props.text}`}
                            onChange={onChange}
                            id="password"
                            required
                            minLength={8}
                        />
                        <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)} // Toggle the password visibility state
                        >
                            {showPassword ? "Hide" : "Show"} {/* Change the button text based on visibility */}
                        </button>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>

            <p className='mt-5'>I Don't have an Account? <Link to='/signup'>SignUp</Link></p>
        </div>
    );
}
