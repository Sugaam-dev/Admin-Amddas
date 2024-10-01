import axios from 'axios';
import {jwtDecode} from 'jwt-decode'
import { loginRequest, loginSuccess, loginFailure, logout, clearError } from './authSlice';
import { port } from '../port/portno.js';

// Login action
export const loginUser = (email, password) => async (dispatch) => {
  try {
    dispatch(clearError()); // Clear previous error before making the request
    dispatch(loginRequest());

    // Make the login request to the backend
    const response = await axios.put(`${port}/login`, { email, password });

    if (response.status === 200) {
      const token = response.data; // JWT token is in response.data

      // Decode the JWT to get the user information (like email)
      const decoded = jwtDecode(token); // Decode the JWT token
      const userEmail = decoded.sub; // Assuming the email is stored in the "sub" field of the JWT
      const userId = decoded.userId; // Assuming userId is stored in the token

      // Dispatch success action with token and decoded email and userId
      dispatch(loginSuccess({ token, email: userEmail, userId }));

    } else {
      dispatch(loginFailure({ error: "Invalid login credentials" }));
    }
  } catch (error) {
    let errorMessage = "Login failed. Please try again.";
    
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage ="Invalid login credentials"; // Backend specific error message
    } else if (error.message) {
      errorMessage = "Invalid login credentials"; // Generic error message (network issues, etc.)
    }

    dispatch(loginFailure({ error: errorMessage }));
  }
};

// Logout action
export const logoutUser = () => (dispatch) => {
  dispatch(logout()); // Clears token and email from the store
};
