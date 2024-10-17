import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Correct default import

import { port } from '../port/portno';
import { logoutUser } from '../Redux/authActions';
import '../Styles/dashboard.css';

function TokenValidation() {

    // State hooks for dropdown and calendar
    const [selectedEmailDomain, setSelectedEmailDomain] = useState(
      '@borgwarner.com'
    );

     // Handler functions
  const handleEmailChange = (e) => {
    setSelectedEmailDomain(e.target.value);
  };
    
  // State for OTP validation
  const [otp, setOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [error, setError] = useState('');
  const [menuid, setMenuid] = useState('');
  const [dish, setDish] = useState('');
const[menuType,setMenuType]=useState('')
const[quantity,setQuantity]=useState()
const[uses,SetUses]=useState()

console.log(quantity)
console.log(uses)


  // Redux Selectors
  const jwtToken = useSelector((state) => state.auth.token);
  const email = useSelector((state) => state.auth.email); // Get the logged-in user's email
  const dispatch = useDispatch();
  const navigate = useNavigate();
//   console.log('Current Menu ID:', menuid);


// console.log(menuType)


 
console.log(jwtToken)
 

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
        `${port}/api/order-details/verify-token?token=${otp}`,
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
setMenuType(response.data.menuType)
    setQuantity(response.data.quantity)
    SetUses(response.data.orderQtyCount)

      // Set otpMessage using the determined dish
      setOtpMessage('Token is valid');

     

      setOtp(''); // Clear the input field after successful validation
      // Handle the response as needed
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('');
      
      } else {
        setError(
          'This token has already been validated. Please request a new one.'
        );
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



  return (
    <div className="dashboard-section">
       <div className="input-box">
          <label htmlFor="email-domain">Select Email Domain:</label>
          <select
            id="email-domain"
            className="bulk-booking-dropdown"
            value={selectedEmailDomain}
            onChange={handleEmailChange}
          >
            <option value="@borgwarner.com">@borgwarner.com</option>
            {/* <option value="@gmail.com">@gmail.com</option>   */}
          </select>
        </div>
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
      {otpMessage && menuType && (
        <p className="otp-message-dashboard success">
          {otpMessage}{' '}
          <span>{menuType}</span>
        </p>
      )}
      {error && <p className="otp-message-dashboard error">{error}</p>}
    </div>
  );
}

export default TokenValidation;
