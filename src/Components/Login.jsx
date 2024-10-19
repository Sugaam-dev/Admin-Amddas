import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../Redux/authActions';
import { clearError } from '../Redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import '../Styles/login.css';
import AutoTyping from './AutoTyping';
import TextField from '@mui/material/TextField';

const Log = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const texts = [
    'Attention! To log in to the Admin Panel, you are required to first register on our website.'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(email, password));
  };

  const sign = () => {
    navigate('/signup');
  };

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="intro">
          <div className="au">
            <p><AutoTyping texts={texts} speed={100} delay={1500} /></p>
          </div>
        </div>
      </div>
      <div className="login-right">
        <div className="rightLogo">
          <img src="./images/amd.png" alt="" />
        </div>
        <h2>Hello, Welcome to</h2>
        <h2><span>Amddas Foods</span></h2>
        <form onSubmit={handleSubmit}>
          <TextField 
            id="outlined-basic" 
            label="Email" 
            variant="outlined" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br />
          <TextField 
            id="outlined-basic" 
            label="Password" 
            variant="outlined" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <div className="remember-me">
            <label>
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
            {/* <div className="forgot-password">
              <Link to='/forgot-password' style={{ fontSize: "16px", color: "#000" }}>
                Forgot Password?
              </Link>
            </div> */}
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div className="but">
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {/* <button onClick={sign} className="signup-btn">Sign up</button> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Log;
