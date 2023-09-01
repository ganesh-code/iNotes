import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register(props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfPassword, setShowConfPassword] = useState(false);

    const [credentials, setCredentials] = useState({
        name: '',
        email: '',
        password: '',
        confPassword: '',
    });

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (credentials.password !== credentials.confpassword) {
            props.showAlert("Passwords didn't match", 'danger');
            return;
        }

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

        if (json.success) {
            // Save the authToken and redirect
            localStorage.setItem('token', json.authToken);
            props.showAlert('Account Created Successfully', 'success');
            navigate('/'); // Redirect to the desired page after successful registration
        } else {
            props.showAlert(json.error, 'danger');
        }
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <div className="container m-5">
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        className="form-control"
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
                        className="form-control"
                        onChange={onChange}
                        id="email"
                        aria-describedby="emailHelp"
                        required
                    />
                    <div id="emailHelp" className="form-text">
                        We'll never share your email with anyone else.
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        Password
                    </label>
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className="form-control"
                            onChange={onChange}
                            id="password"
                            required
                            minLength={8}
                        />
                        <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="confPassword" className="form-label">
                        Confirm Password
                    </label>
                    <div className="input-group">
                        <input
                            type={showConfPassword ? "text" : "password"}
                            name="confpassword"
                            className="form-control"
                            onChange={onChange}
                            id="confPassword"
                            required
                            minLength={8}
                        />
                        <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowConfPassword(!showConfPassword)}
                        >
                            {showConfPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary">
                    Submit
                </button>
            </form>
        </div>
    );
}
