import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Correct import
import { toast, ToastContainer } from 'react-toastify';  // Import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css';  // Import the default toast styles

const SignInForm = ({ toggleForm, setShowNotification, setNotificationMessage, handleSignInSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('API URL:', process.env.REACT_APP_API_URL); 

    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signin`, {
            email,
            password,
        });

        // Check if the response contains a token and user ID
        if (response.data.token && response.data.userId) {
            // Store the token and user ID in local storage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.userId); // Assuming userId is returned in response

            // Notify the user of successful sign in
            toast.success('Successfully signed in!');  // Show success toast
            setNotificationMessage(response.data.message);
            console.log(response.data.message);
            setShowNotification(true);
            handleSignInSuccess(); // Notify parent component of successful sign-in

            // Navigate to the "/prompt" page
            navigate("/prompt");
        } else {
            throw new Error('Invalid response from server'); // Handle unexpected response structure
        }
    } catch (error) {
        // Show error toast if there was an error during sign-in
        // toast.error(error.response ? error.response.data.message : 'Server error. Please try again later.');
        // setError(error.response ? error.response.data.message : 'Server error. Please try again later.');
        // setNotificationMessage(error.response ? error.response.data.message : 'Server error. Please try again later.');
        setShowNotification(true);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="wrapper-login slide-in">
      <h2>Member Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-box">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby="emailHelp"
          />
          <label>Enter Your Email</label>
        </div>
        <div className="input-box">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="passwordHelp"
          />
          <label>Enter Your Password</label>
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="error-message">{error}</p>}
        <div className="register-link">
          <p>
            Don't have an account?{" "}
            <button onClick={() => toggleForm("signUp")} className="link-button">
              Register
            </button>
          </p>
          <p>
            <button onClick={() => toggleForm("forgotPassword")} className="link-button">
              Forgot Password?
            </button>
          </p>
        </div>
      </form>

      {/* ToastContainer to display toasts */}
      <ToastContainer />
    </div>
  );
};

export default SignInForm;
