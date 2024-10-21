// Bulkbooking.jsx

import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { RiDeleteBin5Fill } from 'react-icons/ri'; // Import RiDeleteBin5Fill
import { useSelector } from 'react-redux';
import { port } from '../port/portno';
import '../Styles/bulkbooking.css';
import Calender from './Cal'; // Ensure this path is correct
import Sidebar from './Sidebar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField'; // Import TextField for Edit Dialog
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Bulkbooking = () => {
  // State Variables
  const [bookedDay, setBookedDay] = useState('');
  const [menuData, setMenuData] = useState({});
  const [menuType, setMenuType] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [bookingDate, setBookingDate] = useState(null);

  const [isOrderDetailsLoading, setIsOrderDetailsLoading] = useState(false);
  const [response, setResponse] = useState([]);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  
  // States for Cancellation Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState('');
  const [cancellationDate, setCancellationDate] = useState('');

  // States for Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [tokenToEdit, setTokenToEdit] = useState('');
  const [newQuantity, setNewQuantity] = useState('');

  // Define quantityMap and setQuantityMap
  const [quantityMap, setQuantityMap] = useState({});

  // Redux Selectors
  const jwtToken = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.userId); // Ensure userId is in Redux store

  // **New Selectors for Role and Email**
  const userRole = useSelector((state) => state.auth.role); // Ensure 'role' is available in Redux store
  const userEmail = useSelector((state) => state.auth.email); // Ensure 'email' is available in Redux store

  /**
   * Formats a date string to 'YYYY-MM-DD'.
   * @param {Date} date - Date object to format.
   * @returns {string|null} - Formatted date or null if invalid.
   */
  const formatDateToYYYYMMDD = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return null;
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  /**
   * Checks if the current time is between 12 PM and 8 PM.
   * @returns {boolean} - True if within allowed time, else false.
   */
  // const isWithinAllowedTime = () => {
  //   const now = new Date();
  //   const hours = now.getHours();
  //   return hours >= 12 && hours < 20; // 12 PM to 8 PM
  // };
  const isWithinAllowedTime = () => true; // Always return true for testing
  // Fetch Order Details Based on User ID
  const fetchOrderDetails = async (userId) => {
    if (!userId) return;
    try {
      setIsOrderDetailsLoading(true); // Start loading
      const response = await axios.get(`${port}/api/order-details/user?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const fetchedOrderDetails = response.data;
      setOrder(response.data);
      
      // Populate quantityMap based on deliveryDate
      const tempQuantityMap = {};

      fetchedOrderDetails.forEach((orderDetail) => {
        const deliveryDate = formatDateToYYYYMMDD(new Date(orderDetail.deliveryDate));
        if (deliveryDate) {
          if (!tempQuantityMap[deliveryDate]) {
            tempQuantityMap[deliveryDate] = 0;
          }
          // Assuming isActive === 1 indicates an active token
          if (orderDetail.isActive === 1) {
            tempQuantityMap[deliveryDate] += orderDetail.quantity; // Use 'quantity' from API
          }
        }
      });

      setQuantityMap(tempQuantityMap);

      setResponse(
        fetchedOrderDetails.map((item) => ({
          token: item.token,
          quantity: item.quantity, // Use the 'quantity' from API
          deliveryDate: formatDateToYYYYMMDD(new Date(item.deliveryDate)),
        }))
      );
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching order details:', error);
      if (error.response && error.response.status === 403) {
        setError('You need to login again.');
      } else {
        setError('Failed to fetch order details. Please try again.');
      }
    } finally {
      setIsOrderDetailsLoading(false); // End loading
    }
  };

  // Fetch order details on component mount or when userId changes
  useEffect(() => {
    if (userId) {
      fetchOrderDetails(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwtToken, userId]);

  /**
   * Handles the date selected from the Calendar component.
   */
  const handleDateSelected = useCallback((date) => {
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

    setQuantity(0);
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
   * Handles quantity changes via direct input.
   */
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setQuantity('');
      return;
    }
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      setQuantity(parsedValue); // Use the parsed value directly
    }
  };

  /**
   * Increment quantity
   */
  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  /**
   * Decrement quantity
   */
  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  /**
   * Handles form submission to book the selected menu on the booking date.
   */
  const handleSubmit = async () => {
    if (!selectedMenuId) {
      setMessage('Please select a valid menu type.');
      toast.error('Please select a valid menu type.');
      return;
    }

    if (!bookingDate) {
      setMessage('Please select a booking date.');
      toast.error('Please select a booking date.');
      return;
    }

    if (!quantity || quantity < 1) {
      setMessage('Please enter a valid quantity.');
      toast.error('Please enter a valid quantity.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setTokenId('');

    // Format the booking date to YYYY-MM-DD
    const formattedBookingDate = formatDateToYYYYMMDD(bookingDate);

    // **Format menuIds and quantities as comma-separated strings**
    const menuIdsStr = [selectedMenuId].join(',');
    const quantitiesStr = [quantity].join(',');

    // **Include role and email in the API URL**
    const url = `${port}/api/orders/submit?menuIds=${menuIdsStr}&quantities=${quantitiesStr}&deliveryDate=${formattedBookingDate}&role=${userRole}&email=${encodeURIComponent(userEmail)}`;

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

      // **Assuming the response is a plain text message**
      const dataString = response.data;

      // **Extract tokenId using regex (if multiple tokens, adjust accordingly)**
      const tokenRegex = /Your tokens are:\s*([\d,]+)/i;
      const match = dataString.match(tokenRegex);

      if (match && match[1]) {
        const tokens = match[1].split(',').map(token => token.trim());
        setTokenId(tokens.join(', ')); // Display all tokens
        setMessage('Booking successful!');
        toast.success('Booking successful!');
      } else {
        setMessage('Booking successful, but token ID could not be retrieved.');
        toast.info('Booking successful, but token ID could not be retrieved.');
      }

      // Optionally, refresh order details after booking
      if (userId) {
        fetchOrderDetails(userId);
      }
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        if (error.response.status === 403) {
          setMessage('You are not authorized to perform this action.');
          toast.error('You are not authorized to perform this action.');
        } else if (error.response.status === 400) {
          setMessage('Bad request. Please check your input.');
          toast.error('Bad request. Please check your input.');
        } else {
          setMessage(`Error: ${error.response.data.message || 'An error occurred.'}`);
          toast.error(`Error: ${error.response.data.message || 'An error occurred.'}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        setMessage('No response from server. Please try again later.');
        toast.error('No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request
        setMessage(`Error: ${error.message}`);
        toast.error(`Error: ${error.message}`);
      }
      console.error('Booking Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles opening the cancellation confirmation dialog.
   * @param {Event} e - The event triggered by clicking the delete button.
   * @param {string} token - The token ID to be deleted.
   * @param {string} deliveryDate - The delivery date associated with the token.
   */
  const handleClickOpen = (e, token, deliveryDate) => {
    e.preventDefault();
    setIsDialogOpen(true);
    setTokenToDelete(token);
    setCancellationDate(deliveryDate); // Set the date of the token to be cancelled
  };

  /**
   * Handles closing the cancellation confirmation dialog.
   */
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  /**
   * Handles confirming the cancellation of a token.
   */
  const handleConfirmCancellation = async (e) => {
    e.preventDefault();

    // Check if within allowed time before proceeding
    if (!isWithinAllowedTime()) {
      setError('Token cancellation is only allowed between 12 PM to 8 PM.');
      setIsDialogOpen(false);
      toast.error('Token cancellation is only allowed between 12 PM to 8 PM.');
      return;
    }

    try {
      // Prepare the request data
      let data = JSON.stringify({
        token: tokenToDelete, // Pass token
      });

      // API request configuration
      let config = {
        method: 'put',
        maxBodyLength: Infinity, // Allow large request body
        url: `${port}/api/order-details/cancel`, // Correct API URL
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        data: data,
      };

      // Make API request to cancel the token
      const response = await axios.request(config);

      if (response.status === 200) {
        // If successful, remove the token from the state
        setError(''); // Clear any previous error messages

        // Remove the delivery date from quantityMap
        setQuantityMap((prevMap) => ({
          ...prevMap,
          [cancellationDate]: (prevMap[cancellationDate] || 1) - 1,
        }));

        // Remove the token from response
        setResponse((prev) => prev.filter((item) => item.token !== tokenToDelete));

        // Close the dialog
        setIsDialogOpen(false);

        // Show toast notification
        toast.success('Your order has been cancelled successfully.');
      } else {
        setError('Failed to cancel order. Please try again.');
        toast.error('Failed to cancel order. Please try again.');
      }
    } catch (error) {
      // Log error for debugging
      console.error('Error cancelling order:', error);

      if (error.response?.status === 500) {
        setError('Invalid cancellation request.');
        toast.error('Invalid cancellation request.');
      } else {
        setError('An error occurred while cancelling the order. Please try again.');
        toast.error('An error occurred while cancelling the order. Please try again.');
      }
    }
  };

  /**
   * Handles opening the edit dialog.
   * @param {Event} e - The event triggered by clicking the edit button.
   * @param {string} token - The token ID to be edited.
   * @param {number} currentQuantity - The current quantity of the token.
   */
  const handleEditClick = (e, token, currentQuantity) => {
    e.preventDefault();
    setIsEditDialogOpen(true);
    setTokenToEdit(token);
    setNewQuantity(currentQuantity);
  };

  /**
   * Handles closing the edit dialog.
   */
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setTokenToEdit('');
    setNewQuantity('');
  };

  /**
   * Handles confirming the edit of a token's quantity.
   */
  const handleConfirmEdit = async (e) => {
    e.preventDefault();

    // Validate new quantity
    const parsedQuantity = parseInt(newQuantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      toast.error('Please enter a valid quantity.');
      return;
    }

    // Check if within allowed time before proceeding
    if (!isWithinAllowedTime()) {
      setError('Token editing is only allowed between 12 PM to 8 PM.');
      setIsEditDialogOpen(false);
      toast.error('Token editing is only allowed between 12 PM to 8 PM.');
      return;
    }

    try {
      // API request configuration
      const config = {
        method: 'put',
        maxBodyLength: Infinity, // Allow large request body
        url: `${port}/api/order-details/update?token=${tokenToEdit}&quantity=${parsedQuantity}`,
        headers: { 
          'Authorization': `Bearer ${jwtToken}`
        }
      };

      // Make API request to update the token
      const response = await axios.request(config);

      console.log('Update API Response:', response.data); // Verify response structure

      if (response.status === 200) {
        // Update the quantity in the local state
        setResponse((prev) =>
          prev.map((item) =>
            item.token === tokenToEdit ? { ...item, quantity: parsedQuantity } : item
          )
        );

        // Optionally, update quantityMap based on the new quantity
        setQuantityMap((prevMap) => {
          const updatedMap = { ...prevMap };
          
          // Assuming response.data is the updated order item
          const updatedItem = response.data; // Adjust based on actual response structure
          
          if (updatedItem) {
            const deliveryDate = formatDateToYYYYMMDD(new Date(updatedItem.deliveryDate));
            
            // Find the previous quantity for this delivery date
            const previousQuantity = prevMap[deliveryDate] || 0;

            // Calculate the new total quantity
            // This assumes you only have one token per delivery date.
            // Adjust this logic if multiple tokens can share the same delivery date.
            updatedMap[deliveryDate] = previousQuantity - (prevMap[deliveryDate] || 0) + parsedQuantity;
          }

          return updatedMap;
        });

        // Close the dialog
        setIsEditDialogOpen(false);

        // Show toast notification
        toast.success('Your order has been updated successfully.');
      } else {
        setError('Failed to update order. Please try again.');
        toast.error('Failed to update order. Please try again.');
      }
    } catch (error) {
      // Log error for debugging
      console.error('Error updating order:', error);

      if (error.response?.status === 400) {
        setError('Bad request. Please check your input.');
        toast.error('Bad request. Please check your input.');
      } else {
        setError('An error occurred while updating the order. Please try again.');
        toast.error('An error occurred while updating the order. Please try again.');
      }
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <h2 className="section-heading-dashboard">Bulk Booking</h2>

        {/* Calendar Section */}
        <div className="calendar-section">
          <Calender passdata={handleDateSelected} />
        </div>

        {/* Display Selected Booking Date */}
        {bookingDate && (
          <p className="booking-date-display">
            <strong>Booking Date:</strong> {bookingDate.toLocaleDateString('en-US')}
          </p>
        )}

        {/* Display Booking Day */}
        {bookedDay && (
          <p className="booking-day-display">
            <strong>Booking for:</strong> {bookedDay}
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
            {Object.keys(menuData).length > 1 && <option value="">Select Menu Type</option>}
            {Object.keys(menuData).map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity Selector */}
        <div className="bulk-booking-counter">
          <label htmlFor="quantity">Quantity:</label>
          <div className="quantity-selector">
            <button
              className="counter-btn"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <FaMinus />
            </button>
            <input
              type="number"
              id="quantity"
              className="quantity-input"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
            />
            <button
              className="counter-btn"
              onClick={incrementQuantity}
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
          disabled={isLoading || !selectedMenuId || !quantity || quantity < 1}
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
              Ensure the security of your Token ID. 
            </h3>
            <div className="token-id-box">
              <span className="token-label">Your Token ID:</span>
              <span className="token-number">{tokenId}</span>
            </div>
          </div>
        )}

        {/* Order Details Section */}
        <div className="order-details-section">
          <h3>Your Orders</h3>
          {isOrderDetailsLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : response.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="order-cards-container">
              {response
                .filter((row) => row.quantity >= 1) // Filter out quantities less than 1
                .map((row, index) => (
                  <div className="otp-card" key={index}>
                    <div className="otp-details">
                      <div className="otp-item">
                        <p className="otp-label">Token ID</p>
                        <p className="otp-value">{row.token}</p>
                      </div>
                      <div className="otp-item">
                        <p className="otp-label">Valid For</p>
                        <p className="otp-value">{row.deliveryDate}</p>
                      </div>
                      <div className="otp-item">
                        <p className="otp-label">Quantity</p>
                        <p className="otp-value">{row.quantity}</p> {/* Display fetched quantity */}
                      </div>
                    </div>

                    <div className="action-icons">
                      {/* Delete Button */}
                      <Button
                        variant="outlined"
                        onClick={(e) => handleClickOpen(e, row.token, row.deliveryDate)}
                        disabled={!isWithinAllowedTime()}
                        title={
                          !isWithinAllowedTime
                            ? 'Token deletion is only allowed between 12 PM to 8 PM.'
                            : 'Delete Token'
                        }
                        style={{ marginRight: '8px' }}
                      >
                        <RiDeleteBin5Fill />
                      </Button>

                      {/* Edit Button */}
                      <Button
                        variant="outlined"
                        onClick={(e) => handleEditClick(e, row.token, row.quantity)}
                        disabled={!isWithinAllowedTime()}
                        title={
                          !isWithinAllowedTime
                            ? 'Token editing is only allowed between 12 PM to 8 PM.'
                            : 'Edit Token'
                        }
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Cancellation Confirmation Dialog */}
        <Dialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          aria-labelledby="confirm-cancellation-dialog-title"
          aria-describedby="confirm-cancellation-dialog-description"
        >
          <DialogTitle id="confirm-cancellation-dialog-title">
            {"Confirm Cancellation"}
          </DialogTitle>
          <div style={{ padding: '0 24px' }}>
            <p>Are you sure you want to cancel the token <strong>{tokenToDelete}</strong>?</p>
          </div>
          <DialogActions>
            <Button
              onClick={handleConfirmCancellation}
              color="error"
              disabled={!isWithinAllowedTime()}
              title={
                !isWithinAllowedTime
                  ? 'Token cancellation is only allowed between 12 PM to 8 PM.'
                  : 'Yes'
              }
            >
              Yes
            </Button>
            <Button onClick={handleCloseDialog} autoFocus>
              No
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Confirmation Dialog */}
        <Dialog
          open={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          aria-labelledby="confirm-edit-dialog-title"
          aria-describedby="confirm-edit-dialog-description"
        >
          <DialogTitle id="confirm-edit-dialog-title">
            {"Edit Quantity"}
          </DialogTitle>
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p>Enter the new quantity for token <strong>{tokenToEdit}</strong>:</p>
            <TextField
              label="New Quantity"
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              inputProps={{ min: 1 }}
              fullWidth
            />
          </div>
          <DialogActions>
            <Button
              onClick={handleConfirmEdit}
              color="primary"
              disabled={!isWithinAllowedTime()}
              title={
                !isWithinAllowedTime
                  ? 'Token editing is only allowed between 12 PM to 8 PM.'
                  : 'Confirm'
              }
            >
              Confirm
            </Button>
            <Button onClick={handleCloseEditDialog} autoFocus>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast Container */}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Bulkbooking;
