import React, { useState } from "react";
import { ToastContainer,toast } from 'react-toastify';  // Import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css';  // Import the default toast styles

const SignUpForm = ({ toggleForm, handleSignUpSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success: Show toast and reset form
        toast.success('Successfully signed up! Now you can sign in.');
        handleSignUpSuccess('Successfully signed up! Now you can sign in.');
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        // Error: Show toast for failed sign-up
        toast.error(data.message || 'Sign up failed. Please try again.');
        handleSignUpSuccess(data.message || 'Sign up failed. Please try again.');
      }
    } catch (error) {
      // Network error: Show toast for server error
      console.error('Error during sign up:', error);
      toast.error('Server error. Please try again later.');
      handleSignUpSuccess('Server error. Please try again later.');
    }
  };

  return (
    <div className="wrapper-login slide-in">
      <h2>Member Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-box">
          <input 
            type="text" 
            name="username" 
            required 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label>Enter Your Username</label>
        </div>
        <div className="input-box">
          <input 
            type="email" 
            name="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Enter Your Email</label>
        </div>
        <div className="input-box">
          <input 
            type="password" 
            name="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Enter Your Password</label>
        </div>
        <button type="submit" className="btn">
          Sign Up
        </button>
        <div className="register-link1">
          <p>
            Already have an account?{" "}
            <button onClick={() => toggleForm("signIn")} className="link-button">
              Sign In
            </button>
          </p>
        </div>
      </form>

      {/* ToastContainer to display toasts */}
      <ToastContainer />
    </div>
  );
};

export default SignUpForm;
