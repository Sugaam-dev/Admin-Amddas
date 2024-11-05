import React, { useState } from 'react';
import '../Styles/dashboard.css';
import { port } from '../port/portno';
import axios from 'axios';
import { useSelector } from 'react-redux';

const TokenCount = () => {
  // State hooks for booking counts
  const [vegCount, setVegCount] = useState(0);
  const [eggCount, setEggCount] = useState(0);
  const [nonVegCount, setNonVegCount] = useState(0);
  const [error, setError] = useState('');

  // State hooks for dropdown and calendar
  const [selectedEmailDomain, setSelectedEmailDomain] = useState('@amddas.net');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectEnd, setEnd] = useState('');

  // Loading and display states
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenCount, setShowTokenCount] = useState(false);

  const jwtToken = useSelector((state) => state.auth.token);

  // Handler functions
  const handleEmailChange = (e) => {
    setSelectedEmailDomain(e.target.value);
  };

  const handleDate = (e) => {
    setEnd(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleCountClick = async () => {
    if (selectedEmailDomain && selectedDate !== '' && selectEnd !== '') {
      setIsLoading(true); // Start loading
      setError(''); // Reset error
      setShowTokenCount(false); // Hide counts while loading new data

      try {
        const response = await axios.get(
          `${port}/api/orders/count?startdate=${selectedDate}&enddate=${selectEnd}&domain=${selectedEmailDomain}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        console.log('API Response:', response);

        setVegCount(response.data.totalVegCount);
        setNonVegCount(response.data.totalNonVegCount);
        setEggCount(response.data.totalEggCount);
        setShowTokenCount(true); // Show counts after successful data fetch
      } catch (err) {
        console.error(err);
        setError('Failed to fetch counts. Please try again.');
      } finally {
        setIsLoading(false); // End loading
      }
    } else {
      setError('Please select both dates and an email domain.');
    }
  };

  return (
    <div className="dashboard-section">
      <h2 className="section-heading-dashboard">TokenCount</h2>

      {/* Selection Section */}
      <div className="selection-section">
        {/* Email Domain Dropdown */}
        <div className="input-box">
          <label htmlFor="email-domain">Select Email Domain:</label>
          <select
            id="email-domain"
            className="bulk-booking-dropdown"
            value={selectedEmailDomain}
            onChange={handleEmailChange}
          >
            <option value="@amddas.net">@amddas.net+@borgwarner.com</option>
            <option value="@borgwarner.com">@borgwarner.com</option>
            <option value="@gmail.com">@gmail.com</option>
          </select>
        </div>

        {/* Date Picker */}
        <div className="input-box">
          <label htmlFor="start-date-picker">From Date:</label>
          <input
            type="date"
            id="start-date-picker"
            className="bulk-booking-dropdown"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>

        <div className="input-box">
          <label htmlFor="end-date-picker">To Date:</label>
          <input
            type="date"
            id="end-date-picker"
            className="bulk-booking-dropdown"
            value={selectEnd}
            onChange={handleDate}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Count Button */}
      <div className="input-box" style={{ width: '100%', textAlign: 'center' }}>
        <button
          className="count-button"
          onClick={handleCountClick}
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? (
            <>
              <span className="spinner"></span> Counting...
            </>
          ) : (
            'Count'
          )}
        </button>
      </div>

      {/* TokenCount Section */}
      {showTokenCount && (
        <div className="total-booking-counts">
          <p>Total Veg Bookings: {vegCount}</p>
          <p>Total Egg Bookings: {eggCount}</p>
          <p>Total Non-Veg Bookings: {nonVegCount}</p>
        </div>
      )}
    </div>
  );
};

export default TokenCount;
