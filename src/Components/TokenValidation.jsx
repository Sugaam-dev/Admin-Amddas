import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Correct default import

import { port } from '../port/portno';
import { logoutUser } from '../Redux/authActions';
import '../Styles/dashboard.css'; // Ensure correct path

function TokenValidation() {
  // State for OTP validation
  const [otp, setOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [error, setError] = useState('');
  const [menuid, setMenuid] = useState('');
  const [dish, setDish] = useState('');

  // Redux Selectors
  const jwtToken = useSelector((state) => state.auth.token);
  const email = useSelector((state) => state.auth.email); // Get the logged-in user's email
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log('Current Menu ID:', menuid);

  // Mapping of menuid to dish
  const dishMap = {
    1: 'Veg',
    2: 'Veg',
    3: 'Veg',
    4: 'Non-Veg',
    5: 'Egg',
    7: 'Veg',
  };

  // Update dish based on menuid
  useEffect(() => {
    if (menuid in dishMap) {
      setDish(dishMap[menuid]);
    } else {
      setDish('Unknown Dish'); // Handle unexpected menuid values
    }
  }, [menuid]);

  // Decode JWT token
  let decoded;
  try {
    decoded = jwtDecode(jwtToken);
    // You can use decoded as needed
    // Removed unnecessary console.log(decoded);
  } catch (e) {
    setError('Invalid token. Please login again.');
    // Optionally, you might want to log out the user and navigate to login
    dispatch(logoutUser());
    navigate('/login');
  }

  // Function to validate OTP and call the API
  const tokenValidate = async () => {
    // Ensure OTP is exactly 4 digits
    if (otp.length !== 4) {
      setError('OTP must be exactly 4 digits.');
      setOtpMessage('');
      return;
    }

    try {
      const response = await axios.get(
        `${port}/api/order-details/verify-token/${otp}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      console.log('API Response:', response);
      setError('');
      const receivedMenuId = response.data.menuId;

      // Update menuid state
      setMenuid(receivedMenuId);

      // Determine dish based on menuid
      const currentDish = dishMap[receivedMenuId] || 'Unknown Dish';

      // Set otpMessage using the determined dish
      setOtpMessage('Token is valid');

      // Update dish state
      setDish(currentDish);

      setOtp(''); // Clear the input field after successful validation
      // Handle the response as needed
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('You need to log in again.');
        dispatch(logoutUser());
        navigate('/login');
      } else {
        setError('This token has already been validated. Please request a new one.');
      }
      setOtpMessage('');
      setDish(''); // Clear the dish if there's an error
      setOtp(''); // Clear the input field after an error
    }
  };

  // Handler for OTP input change
  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Allow only numeric input and limit to 4 characters
    if (/^\d{0,4}$/.test(value)) {
      setOtp(value);
      if (value.length === 4) {
        setError('');
      }
    }
  };

  // Function to determine the class based on the dish type
  const getDishClass = () => {
    switch (dish.toLowerCase()) {
      case 'veg':
        return 'current-dish veg';
      case 'non-veg':
        return 'current-dish non-veg';
      case 'egg':
        return 'current-dish egg';
      default:
        return 'current-dish unknown';
    }
  };

  return (
    <div className="dashboard-section">
      {/* Section 1: OTP Validation */}
      <h2 className="section-heading-dashboard">Token Validation</h2>
      <div className="otp-validation-container">
        <input
          type="text"
          maxLength="4"
          placeholder="Enter 4-digit Token"
          value={otp}
          onChange={handleOtpChange}
          className="otp-input"
          aria-label="4-digit token input"
        />
        <button
          className="validate-dashboard-btn"
          onClick={tokenValidate}
          disabled={otp.length !== 4} // Disable button until OTP is 4 digits
        >
          Validate
        </button>
      </div>
      {/* Display success or error messages */}
      {otpMessage && dish && (
        <p className="otp-message-dashboard success">
          {otpMessage}{' '}
          <span className={getDishClass()}>{dish}</span>
        </p>
      )}
      {error && <p className="otp-message-dashboard error">{error}</p>}
    </div>
  );
}

export default TokenValidation;
