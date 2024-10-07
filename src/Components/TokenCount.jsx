import React, { useState } from 'react';
import '../Styles/dashboard.css'; // Ensure your CSS file is correctly imported
import { port } from '../port/portno';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
const TokenCount = () => {
  // State hooks for booking counts
  const [showTokenCount, setShowTokenCount] = useState(false);
  const [vegCount, setVegCount] = useState(0);
  const [eggCount, setEggCount] = useState(0);
  const [nonVegCount, setNonVegCount] = useState(0);
const[error,setError]=useState('')
  // State hooks for dropdown and calendar
  const [selectedEmailDomain, setSelectedEmailDomain] = useState('@borgwarner.com');
  const [selectedDate, setSelectedDate] = useState('');
const[selelctEnd,setEnd]=useState('')

  const jwtToken = useSelector((state) => state.auth.token);


  // Handler functions
  const handleEmailChange = (e) => {
    setSelectedEmailDomain(e.target.value);
  };

  const handleDate=(e)=>{
    setEnd(e.target.value)
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };



  const handleCountClick = async () => {
if(selectedEmailDomain && selectedDate !== ''){




  try {
    const response = await axios.get(
      `${port}/api/orders/count?startdate=${selectedDate}&enddate=${selelctEnd}&domain=${selectedEmailDomain}`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    console.log('API Response:', response);
    setError('');
 
  
setVegCount(response.data.totalVegCount)
setNonVegCount(response.data.totalNonVegCount)
setEggCount(response.data.totalEggCount)
 

   

  } catch (err) {
   console.log(err)
    }
   
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
            <option value="@borgwarner.com">@borgwarner.com</option>
            <option value="@gmail.com">@gmail.com</option>
          </select>
        </div>

        {/* Date Picker */}
        <div className="input-box">
          <label htmlFor="date-picker">From Date:</label>
          <input
            type="date"
            id="date-picker"
            className="bulk-booking-dropdown"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>

        <div className="input-box">
          <label htmlFor="date-picker">To Date:</label>
          <input
            type="date"
            id="date-picker"
            className="bulk-booking-dropdown"
            value={selelctEnd}
            onChange={handleDate}
          />
        </div>

      </div>

      {/* Count Button */}
      <div className="input-box" style={{ width: '100%', textAlign: 'center' }}>
        <button className="count-button" onClick={handleCountClick}>
          Count
        </button>
      </div>

      {/* TokenCount Section */}

        <div className="total-booking-counts">
          <p>Total Veg Bookings: {vegCount}</p>
          <p>Total Egg Bookings: {eggCount}</p>
          <p>Total Non-Veg Bookings: {nonVegCount}</p>
        </div>
      
    </div>
  );
};

export default TokenCount;
