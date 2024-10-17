// Bulkbooking.jsx

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { port } from '../port/portno';
import '../Styles/dashboard.css';
import Calender from './Cal'; // Ensure this path is correct

const Bulkbooking = () => {
  const [bookedDay, setBookedDay] = useState('');
  const [menuData, setMenuData] = useState({});
  const [menuType, setMenuType] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingDate, setBookingDate] = useState(null); // Mapped booking date

  const jwtToken = useSelector((state) => state.auth.token);

  /**
   * Handles the date selected from the Calender component.
   * Uses the selected date directly as the booking date.
   */
  const handleDateSelected = useCallback((date) => {
    setSelectedDate(date);
    setBookingDate(date); // Use the selected date directly

    // Update the booked day name based on the booking date
    const options = { weekday: 'long' };
    const bookedDayName = date.toLocaleDateString('en-US', options);
    setBookedDay(bookedDayName);

    // Define menu data mapping based on the booked day
    const menuDataMap = {
      Monday: { veg: 1 },
      Tuesday: { veg: 2 },
      Wednesday: { veg: 3, nonVeg: 4, egg: 5 },
      Thursday: { veg: 6 },
      Friday: { veg: 7 },
      // Saturdays and Sundays are not selectable, so no need to add them
    };

    const menuTypesForDay = menuDataMap[bookedDayName] || {};
    setMenuData(menuTypesForDay);

    const menuTypeKeys = Object.keys(menuTypesForDay);

    if (menuTypeKeys.length === 1) {
      const singleMenuType = menuTypeKeys[0];
      setMenuType(singleMenuType);
      setSelectedMenuId(menuTypesForDay[singleMenuType]);
    } else {
      setMenuType('');
      setSelectedMenuId('');
    }

    setQuantity(1);
    setMessage('');
    setTokenId('');
  }, []);

  /**
   * Handles changes in the menu type dropdown.
   */
  const handleMenuTypeChange = (e) => {
    const selectedType = e.target.value;
    setMenuType(selectedType);
    setSelectedMenuId(menuData[selectedType] || '');
    setQuantity(1);
    setMessage('');
    setTokenId('');
  };

  /**
   * Handles quantity changes with increment and decrement.
   */
  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  /**
   * Handles form submission to book the selected menu on the booking date.
   */
  const handleSubmit = async () => {
    if (!selectedMenuId) {
      setMessage('Please select a valid menu type.');
      return;
    }

    if (!bookingDate) { // Use bookingDate instead of selectedDate
      setMessage('Please select a booking date.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setTokenId('');

    // Format the booking date to YYYY-MM-DD
    const year = bookingDate.getFullYear();
    const month = String(bookingDate.getMonth() + 1).padStart(2, '0');
    const day = String(bookingDate.getDate()).padStart(2, '0');
    const formattedBookingDate = `${year}-${month}-${day}`;

    // Construct the API URL with the selected booking date
    const url = `${port}/api/orders/submit?menuIds=${selectedMenuId}&quantities=${quantity}&deliveryDate=${formattedBookingDate}`;

    try {
      const response = await axios.post(
        url,
        {}, // Empty body as per your API requirement
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`, // Include JWT token
          },
        }
      );
      console.log(response);

      // Extract tokenId using the updated regex
      const dataString = response.data;
      const tokenRegex = /Your tokens are:\s*(\d+)/i;
      const match = dataString.match(tokenRegex);

      if (match && match[1]) {
        setTokenId(match[1]);
        setMessage('Booking successful!');
      } else {
        setMessage('Booking successful, but token ID could not be retrieved.');
      }
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        if (error.response.status === 403) {
          setMessage('You are not authorized to perform this action.');
        } else if (error.response.status === 400) {
          setMessage('Bad request. Please check your input.');
        } else {
          setMessage(
            `Error: ${error.response.data.message || 'An error occurred.'}`
          );
        }
      } else if (error.request) {
        // Request was made but no response received
        setMessage('No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request
        setMessage(`Error: ${error.message}`);
      }
      console.error('Booking Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-section">
      <h2 className="section-heading-dashboard">Bulk Booking</h2>

      {/* Integrate the Calender component */}
      <div className="calendar-section">
        <Calender passdata={handleDateSelected} />
      </div>

      {/* Display the selected booking date */}
      {bookingDate && (
        <p className="booking-date-display" style={{ display: "flex", alignItems: "center" }}>
          <strong>Booking Date: </strong>
          <span style={{ marginLeft: "10px" }}>
            {bookingDate.toLocaleDateString('en-US')}
          </span>
        </p>
      )}

      {/* Display the booking day */}
      {bookedDay && (
        <p className="booking-day-display" style={{ display: "flex", alignItems: "center" }}>
          <strong>Booking for: </strong>
          <span style={{ marginLeft: "10px" }}>{bookedDay}</span>
        </p>
      )}

      {/* Menu Type Selection */}
      <div className="menu-type-selection">
        <label htmlFor="menuType">Select Menu Type:</label>
        <select
          id="menuType"
          className="bulk-booking-dropdown"
          value={menuType}
          onChange={handleMenuTypeChange}
          disabled={Object.keys(menuData).length === 1}
        >
          {Object.keys(menuData).length > 1 && (
            <option value="">Select Menu Type</option>
          )}
          {Object.keys(menuData).map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity Selector */}
      <div className="bulk-booking-counter">
        <p>Quantity: {quantity}</p>
        <div className="counter-buttons">
          <button
            className="counter-btn"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <FaMinus />
          </button>
          <button
            className="counter-btn"
            onClick={() => handleQuantityChange(1)}
            aria-label="Increase quantity"
          >
            <FaPlus />
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        className="validate-dashboard-btn"
        onClick={handleSubmit}
        disabled={isLoading || !selectedMenuId}
      >
        {isLoading ? 'Booking...' : 'Submit Booking'}
      </button>

      {/* Message Display */}
      {message && (
        <p
          className={`otp-message-dashboard ${
            message.includes('successful') ? 'success' : 'error'
          }`}
        >
          {message}
        </p>
      )}

      {/* Token ID Display */}
      {tokenId && (
        <div className="token-id-display">
          <h3 className="token-instruction">
            Ensure the security of your Token ID. Warning: The token will no longer be available after a page reload.
          </h3>
          <div className="token-id-box">
            <span className="token-label">Your Token ID:</span>
            <span className="token-number">{tokenId}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bulkbooking;
