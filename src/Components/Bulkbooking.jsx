import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode'; // Ensure this is correctly installed and imported
import { FaPlus, FaMinus } from 'react-icons/fa';
import { useSelector } from 'react-redux'; // To access Redux state
import { port } from '../port/portno';
import '../Styles/dashboard.css'; // Ensure correct path

function Bulkbooking() {
  // State variables for meal counts
  const [vegCount, setVegCount] = useState(0);
  const [eggCount, setEggCount] = useState(0);
  const [nonVegCount, setNonVegCount] = useState(0);

  // State variables for UI feedback
  const [selectedType, setSelectedType] = useState('');
  const [orderResponse, setOrderResponse] = useState('');
  const [error, setError] = useState('');

  // State variables for booking details
  const [token, setToken] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [bookingDate, setBookingDate] = useState('');

  // State variables for available meal types
  const [availableMealTypes, setAvailableMealTypes] = useState([]);

  // Access JWT token and user role from Redux store
  const jwtToken = useSelector(state => state.auth.token); // Adjust based on your Redux setup
  const role = useSelector(state => state.auth.role); // Assuming 'admin' or 'user'

  // Mapping of menuIds based on day and meal type
  const menuIdMap = {
    Monday: {
      veg: 1,
      nonVeg: null,
      egg: null,
    },
    Tuesday: {
      veg: 2,
      nonVeg: null,
      egg: null,
    },
    Wednesday: {
      veg: 3,
      nonVeg: 4,
      egg: 5,
    },
    // Add mappings for other days if necessary
  };

  /**
   * Determines the booking date based on user role and current day.
   * @returns {Date} - The determined booking date.
   */
  const determineBookingDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    let bookingDate = new Date();

    if (role === 'admin') {
      if (dayOfWeek === 1) { // Monday
        bookingDate.setDate(today.getDate() + 1); // Tuesday
      } else if (dayOfWeek === 2) { // Tuesday
        bookingDate.setDate(today.getDate() + 1); // Wednesday
      } else if (dayOfWeek === 3) { // Wednesday
        bookingDate.setDate(today.getDate() - 1); // Tuesday
      } else if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
        // Calculate days to next Monday
        const daysToAdd = (1 + 7 - dayOfWeek) % 7 || 7; // Ensure at least 1 day is added
        bookingDate.setDate(today.getDate() + daysToAdd);
      } else {
        // For other days (e.g., Thursday, Sunday), set bookingDate to Monday
        const daysToAdd = (1 + 7 - dayOfWeek) % 7 || 7;
        bookingDate.setDate(today.getDate() + daysToAdd);
      }
    } else {
      // Regular user books for today
      bookingDate = new Date();
    }

    return bookingDate;
  };

  /**
   * Retrieves the menuId based on booking date and meal type.
   * @param {Date} date - The booking date.
   * @param {string} type - The meal type ('veg', 'non-veg', 'egg').
   * @param {string} role - The role of the user ('admin' or 'user').
   * @returns {number|null} - The corresponding menuId or null if not found.
   */
  const getMenuId = (date, type, role) => {
    let menuDay = date.toLocaleDateString('en-US', { weekday: 'long' });

    // Admin specific mapping: If admin is booking for Tuesday, use Wednesday's menuId
    if (role === 'admin') {
      const bookingDay = date.getDay(); // 0 (Sun) to 6 (Sat)
      if (bookingDay === 2) { // Tuesday
        menuDay = 'Wednesday';
      }
      // If bookingDay is Monday or other days, menuDay remains as bookingDay
    }

    if (menuIdMap[menuDay] && menuIdMap[menuDay][type]) {
      return menuIdMap[menuDay][type];
    } else {
      console.warn(`No menuId found for ${type} on ${menuDay}`);
      return null;
    }
  };

  /**
   * Determines available meal types based on booking date.
   * @param {Date} date - The booking date.
   * @param {string} role - The role of the user.
   * @returns {Array} - Array of available meal types.
   */
  const determineAvailableMealTypes = (date, role) => {
    let menuDay = date.toLocaleDateString('en-US', { weekday: 'long' });

    // Admin specific mapping: If admin is booking for Tuesday, use Wednesday's menuId
    if (role === 'admin') {
      const bookingDay = date.getDay();
      if (bookingDay === 2) { // Tuesday
        menuDay = 'Wednesday';
      }
    }

    const availableTypes = [];
    if (menuIdMap[menuDay]) {
      Object.keys(menuIdMap[menuDay]).forEach(type => {
        if (menuIdMap[menuDay][type] !== null) {
          availableTypes.push(type);
        }
      });
    }

    return availableTypes;
  };

  // Determine booking date and available meal types on component mount or role/day change
  useEffect(() => {
    const bookingDate = determineBookingDate();
    setBookingDate(bookingDate);
    const availableTypes = determineAvailableMealTypes(bookingDate, role);
    setAvailableMealTypes(availableTypes);
    // Reset selected meal type and counts when booking date changes
    setSelectedType('');
    setVegCount(0);
    setEggCount(0);
    setNonVegCount(0);
  }, [role]);

  // Handle incrementing meal counts
  const incrementMeal = (type) => {
    if (type === 'veg') setVegCount(prev => prev + 1);
    if (type === 'egg') setEggCount(prev => prev + 1);
    if (type === 'non-veg') setNonVegCount(prev => prev + 1);
  };

  // Handle decrementing meal counts
  const decrementMeal = (type) => {
    if (type === 'veg' && vegCount > 0) setVegCount(prev => prev - 1);
    if (type === 'egg' && eggCount > 0) setEggCount(prev => prev - 1);
    if (type === 'non-veg' && nonVegCount > 0) setNonVegCount(prev => prev - 1);
  };

  /**
   * Handles the booking submission.
   * @param {Event} e - The form submission event.
   */
  const handleBooking = async (e) => {
    e.preventDefault();

    // Determine the booking date based on role
    const determinedBookingDate = determineBookingDate();
    const dayOfWeek = determinedBookingDate.toLocaleDateString('en-US', { weekday: 'long' });

    const bookings = [];

    // Collect bookings for each meal type
    if (vegCount > 0) {
      const menuId = getMenuId(determinedBookingDate, 'veg', role);
      if (menuId) {
        bookings.push({ menuId, quantity: vegCount });
      }
    }

    if (nonVegCount > 0) {
      const menuId = getMenuId(determinedBookingDate, 'non-veg', role);
      if (menuId) {
        bookings.push({ menuId, quantity: nonVegCount });
      }
    }

    if (eggCount > 0) {
      const menuId = getMenuId(determinedBookingDate, 'egg', role);
      if (menuId) {
        bookings.push({ menuId, quantity: eggCount });
      }
    }

    // Validate that at least one meal type is selected
    if (bookings.length === 0) {
      setError('Please select at least one meal type with quantity.');
      return;
    }

    // Prepare API request parameters
    const menuIds = bookings.map(b => b.menuId).join(',');
    const quantities = bookings.map(b => b.quantity).join(',');
    const url = `${port}/api/orders/submit?menuIds=${menuIds}&quantities=${quantities}&bookingDate=${determinedBookingDate.toISOString()}`;

    try {
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      console.log('Booking Response:', response.data);

      if (response.data.success) {
        const { token, tokenId, bookingDate: responseBookingDate } = response.data.data;

        setOrderResponse(response.data.message || 'Order submitted successfully.');
        setToken(token);
        setTokenId(tokenId);
        setBookingDate(new Date(responseBookingDate));

        // Reset meal counts and selections
        setVegCount(0);
        setNonVegCount(0);
        setEggCount(0);
        setSelectedType('');
        setError('');
      } else {
        // Handle unsuccessful API response
        setError(response.data.message || 'Failed to submit booking.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      setError('Failed to submit booking. Please try again.');
    }
  };

  return (
    <>
      {/* Section: Bulk Booking */}
      <div className="dashboard-section">
        <h2 className="section-heading-dashboard">Bulk Booking</h2>

        {/* Display Booking Date */}
        <p><strong>Booking Date:</strong> {bookingDate ? bookingDate.toLocaleDateString() : 'N/A'}</p>

        {/* Meal Type Selection Dropdown */}
        <select
          className="bulk-booking-dropdown"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">Select Meal Type</option>
          {availableMealTypes.includes('veg') && <option value="veg">Veg</option>}
          {availableMealTypes.includes('egg') && <option value="egg">Egg</option>}
          {availableMealTypes.includes('non-veg') && <option value="non-veg">Non-Veg</option>}
        </select>

        {/* Meal Count Counter */}
        {selectedType && (
          <div className="bulk-booking-counter">
            <p>
              {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Count: {selectedType === 'veg' ? vegCount : selectedType === 'egg' ? eggCount : nonVegCount}
            </p>
            <div className="counter-buttons">
              <button
                className="counter-btn"
                onClick={() => decrementMeal(selectedType)}
                disabled={
                  (selectedType === 'veg' && vegCount === 0) ||
                  (selectedType === 'egg' && eggCount === 0) ||
                  (selectedType === 'non-veg' && nonVegCount === 0)
                }
              >
                <FaMinus />
              </button>
              <button
                className="counter-btn"
                onClick={() => incrementMeal(selectedType)}
              >
                <FaPlus />
              </button>
            </div>
          </div>
        )}

        {/* Display Order Response or Error Messages */}
        {orderResponse && <p className="success-message">{orderResponse}</p>}
        {error && <p className="error-message">{error}</p>}

        {/* Display Token, Token ID, and Booking Date */}
        {token && tokenId && bookingDate && (
          <div className="booking-details">
            <h3>Booking Details</h3>
            <p><strong>Token:</strong> {token}</p>
            <p><strong>Token ID:</strong> {tokenId}</p>
            <p><strong>Booking Date:</strong> {bookingDate.toLocaleDateString()}</p>
          </div>
        )}

        {/* Book Booking Button */}
        <button className="book-booking-btn" onClick={handleBooking}>
          Book Booking
        </button>
      </div>
    </>
  );
}

export default Bulkbooking;
