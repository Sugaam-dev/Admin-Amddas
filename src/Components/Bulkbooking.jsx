// import React, { useState } from 'react';
// import axios from 'axios';
// import { FaPlus, FaMinus } from 'react-icons/fa';
// import { useSelector } from 'react-redux';
// import { port } from '../port/portno';
// import '../Styles/dashboard.css';

// const Bulkbooking = () => {
//   const [menuType, setMenuType] = useState('');
//   const [selectedMenuId, setSelectedMenuId] = useState('');
//   const [quantity, setQuantity] = useState(1);
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   const jwtToken = useSelector((state) => state.auth.token); // Adjust based on your Redux state structure

//   // Define the menu IDs based on the types
//   const menuData = {
//     veg: 3, // Example: 'veg' corresponds to menu ID 3
//     nonVeg: 4, // 'nonVeg' corresponds to menu ID 4
//     egg: 5, // 'egg' corresponds to menu ID 5
//   };

//   // Handle dropdown change
//   const handleMenuTypeChange = (e) => {
//     const selectedType = e.target.value;
//     setMenuType(selectedType);
//     setSelectedMenuId(menuData[selectedType] || '');
//     setQuantity(1);
//     setMessage('');
//   };

//   // Handle quantity change
//   const handleQuantityChange = (delta) => {
//     setQuantity((prev) => Math.max(1, prev + delta));
//   };

//   // Handle form submission
//   const handleSubmit = async () => {
//     if (!selectedMenuId) {
//       setMessage('Please select a valid menu type.');
//       return;
//     }

//     setIsLoading(true);
//     setMessage('');

//     // Corrected URL with 'quantity' instead of 'quantities'
//     const url = `${port}/api/orders/submit?menuIds=${selectedMenuId}&quantities=${quantity}`;

//     try {
//       const response = await axios.post(
//         url,
//         {}, // Empty body as per your API requirement
//         {
//           headers: {
//             Authorization: `Bearer ${jwtToken}`, // Include JWT token
//           },
//         }
//       );
//       console.log(response);
//       setMessage('Booking successful!');
//     } catch (error) {
//       if (error.response) {
//         // Server responded with a status other than 2xx
//         if (error.response.status === 403) {
//           setMessage('You are not authorized to perform this action.');
//         } else if (error.response.status === 400) {
//           setMessage('Bad request. Please check your input.');
//         } else {
//           setMessage(
//             `Error: ${error.response.data.message || 'An error occurred.'}`
//           );
//         }
//       } else if (error.request) {
//         // Request was made but no response received
//         setMessage('No response from server. Please try again later.');
//       } else {
//         // Something happened in setting up the request
//         setMessage(`Error: ${error.message}`);
//       }
//       console.error('Booking Error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="dashboard-section">
//       <h2 className="section-heading-dashboard">Bulk Booking</h2>

//       <select
//         className="bulk-booking-dropdown"
//         value={menuType}
//         onChange={handleMenuTypeChange}
//       >
//         <option value="">Select Menu Type</option>
//         {Object.keys(menuData).map((type) => (
//           <option key={type} value={type}>
//             {type.charAt(0).toUpperCase() + type.slice(1)}
//           </option>
//         ))}
//       </select>

//       <div className="bulk-booking-counter">
//         <p>Quantity: {quantity}</p>
//         <div className="counter-buttons">
//           <button
//             className="counter-btn"
//             onClick={() => handleQuantityChange(-1)}
//             disabled={quantity <= 1}
//           >
//             <FaMinus />
//           </button>
//           <button
//             className="counter-btn"
//             onClick={() => handleQuantityChange(1)}
//           >
//             <FaPlus />
//           </button>
//         </div>
//       </div>

//       <button
//         className="validate-dashboard-btn"
//         // onClick={handleSubmit}
//         disabled={isLoading || !selectedMenuId}
//       >
//         {isLoading ? 'Booking...' : 'Submit Booking'}
//       </button>

//       {message && (
//         <p
//           className={`otp-message-dashboard ${
//             message.includes('successful') ? 'success' : 'error'
//           }`}
//         >
//           {message}
//         </p>
//       )}
//     </div>
//   );
// };

// export default Bulkbooking;




import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { port } from '../port/portno';
import '../Styles/dashboard.css';

const Bulkbooking = () => {
  const [bookedDay, setBookedDay] = useState(''); // Stores the booking day name
  const [menuData, setMenuData] = useState({}); // Dynamic menu IDs based on booking day
  const [menuType, setMenuType] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tokenId, setTokenId] = useState(''); // New state for tokenId

  const jwtToken = useSelector((state) => state.auth.token); // Adjust based on your Redux state structure

  useEffect(() => {
    // Function to determine the booking day based on current day
    const determineBookingDay = () => {
      const today = new Date();
      const currentDay = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      let bookedDayDate;

      if (currentDay >= 1 && currentDay <= 4) {
        // Monday to Thursday: Book for the next day
        bookedDayDate = new Date(today);
        bookedDayDate.setDate(today.getDate() + 1);
      } else if (currentDay === 5 || currentDay === 6) {
        // Friday or Saturday: Book for Monday
        const daysToAdd = 8 - currentDay; // 5 (Friday) +3=Monday, 6 (Saturday)+2=Monday
        bookedDayDate = new Date(today);
        bookedDayDate.setDate(today.getDate() + daysToAdd);
      } else {
        // Sunday: Book for Monday
        bookedDayDate = new Date(today);
        bookedDayDate.setDate(today.getDate() + 1);
      }

      const options = { weekday: 'long' };
      const bookedDayName = bookedDayDate.toLocaleDateString('en-US', options);

      return bookedDayName;
    };

    // Define the menu mapping based on the booking day
    const menuDataMap = {
      Monday: {
        veg: 1,
      },
      Tuesday: {
        veg: 2,
      },
      Wednesday: {
        veg: 3,
        nonVeg: 4,
        egg: 5,
      },
      Thursday: {
        veg: 6,
      },
      Friday: {
        veg: 7,
      },
      // If needed, handle Saturday and Sunday
      // For example:
      // Sunday: { veg: 8 },
    };

    const bookingDay = determineBookingDay();
    setBookedDay(bookingDay);

    const menuTypesForDay = menuDataMap[bookingDay] || {};
    setMenuData(menuTypesForDay);

    const menuTypeKeys = Object.keys(menuTypesForDay);

    if (menuTypeKeys.length === 1) {
      // If only one menu type is available, auto-select it
      const singleMenuType = menuTypeKeys[0];
      setMenuType(singleMenuType);
      setSelectedMenuId(menuTypesForDay[singleMenuType]);
    } else {
      // Reset selection if multiple menu types are available
      setMenuType('');
      setSelectedMenuId('');
    }

    // Reset quantity and messages when booking day changes
    setQuantity(1);
    setMessage('');
    setTokenId('');
  }, []);

  // Handle dropdown change
  const handleMenuTypeChange = (e) => {
    const selectedType = e.target.value;
    setMenuType(selectedType);
    setSelectedMenuId(menuData[selectedType] || '');
    setQuantity(1);
    setMessage('');
    setTokenId('');
  };

  // Handle quantity change
  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedMenuId) {
      setMessage('Please select a valid menu type.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setTokenId(''); // Reset tokenId before a new request

    // Construct the booking date in YYYY-MM-DD format
    const today = new Date();
    const currentDay = today.getDay();
    let bookedDayDate;

    if (currentDay >= 1 && currentDay <= 4) {
      bookedDayDate = new Date(today);
      bookedDayDate.setDate(today.getDate() + 1);
    } else if (currentDay === 5 || currentDay === 6) {
      const daysToAdd = 8 - currentDay;
      bookedDayDate = new Date(today);
      bookedDayDate.setDate(today.getDate() + daysToAdd);
    } else {
      bookedDayDate = new Date(today);
      bookedDayDate.setDate(today.getDate() + 1);
    }

    const year = bookedDayDate.getFullYear();
    const month = String(bookedDayDate.getMonth() + 1).padStart(2, '0');
    const day = String(bookedDayDate.getDate()).padStart(2, '0');
    const bookingDate = `${year}-${month}-${day}`;

    // Maintain the original API call structure
    const url = `${port}/api/orders/submit?menuIds=${selectedMenuId}&quantities=${quantity}`;

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
      
      // Extract tokenId using regex
      const dataString = response.data;
      const tokenRegex = /token Id is\s*-?(\d+)/i;
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

      {/* Display the booking day */}
      {bookedDay && (
        <p className="booking-day-display" style={{display:"flex",alignItems:"center"}}>
          <strong>Booking for :   </strong> <h2>{ bookedDay}</h2> 
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




