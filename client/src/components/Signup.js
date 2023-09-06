import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register(props) {
    // State to manage password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfPassword, setShowConfPassword] = useState(false);

    // State to manage form input values
    const [credentials, setCredentials] = useState({
        name: '',
        email: '',
        password: '',
        confPassword: '',
    });

    // Use 'useNavigate' to programmatically navigate within the application
    const navigate = useNavigate();

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (credentials.password !== credentials.confPassword) {
            props.showAlert("Passwords didn't match", 'danger');
            return;
        }

        // Send a POST request to create a new user account
        const response = await fetch('http://localhost:5500/api/auth/createuser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: credentials.name,
                email: credentials.email,
                password: credentials.password,
            }),
        });
        const json = await response.json();
        console.log(json)

        if (json.success) {
            // Save the authentication token to local storage and show a success alert
            localStorage.setItem('token', json.authToken);
            props.showAlert('Account Created Successfully', 'success');

            // Redirect to the desired page after successful registration
            navigate('/');
        } else {
            // Show an error alert if registration fails
            props.showAlert(json.error, 'danger');
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
                    <label htmlFor="name" className="form-label">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        className={`form-control bg-${props.theme} text-${props.text}`}
                        onChange={onChange}
                        id="name"
                        aria-describedby="nameHelp"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                        Email address
                    </label>
                    <input
                        type="email"
                        name="email"
                        className={`form-control bg-${props.theme} text-${props.text}`}
                        onChange={onChange}
                        id="email"
                        aria-describedby="emailHelp"
                        required
                    />
                    <div id="emailHelp" className={`form-text text-${props.text}`}>
                        We'll never share your email with anyone else.
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
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
                <div className="mb-3">
                    <label htmlFor="confPassword" className="form-label">
                        Confirm Password
                    </label>
                    <div className="input-group">
                        <input
                            type={showConfPassword ? "text" : "password"} // Toggle password visibility
                            name="confPassword"
                            className={`form-control bg-${props.theme} text-${props.text}`}
                            onChange={onChange}
                            id="confPassword"
                            required
                            minLength={8}
                        />
                        <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowConfPassword(!showConfPassword)} // Toggle the password visibility state
                        >
                            {showConfPassword ? "Hide" : "Show"} {/* Change the button text based on visibility */}
                        </button>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary">
                    Submit
                </button>
            </form>

            {/* Link to the login page */}
            <p className='mt-5'>I Already have an Account? <Link to='/login'>Login</Link></p>
        </div>
    );
}
