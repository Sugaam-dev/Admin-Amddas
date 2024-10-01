import React, { useState } from 'react';
import '../Styles/dashboard.css';

import { useDispatch } from 'react-redux';
import { logoutUser } from '../Redux/authActions';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus, FaTachometerAlt, FaFileAlt, FaUtensils, FaSignOutAlt } from 'react-icons/fa';
import TokenValidation from './TokenValidation';
import Bulkbooking from './Bulkbooking';

const Dashboard = () => {
    // State for OTP validation
    const [otp, setOtp] = useState('');
    const [otpMessage, setOtpMessage] = useState('');

    // State for meal count
    const [mealCount] = useState(50);

    // State for bulk booking counters
    const [vegCount, setVegCount] = useState(0);
    const [eggCount, setEggCount] = useState(0);
    const [nonVegCount, setNonVegCount] = useState(0);

    // State for displaying Total Booking
    const [showTotalBooking, setShowTotalBooking] = useState(false);

    // State for Bulk Booking selection
    const [selectedType, setSelectedType] = useState('');

    // Handle OTP validation
    const validateOtp = () => {
        if (otp === '1234') {
            setOtpMessage('Token is valid!');
        } else {
            setOtpMessage('Invalid token!');
        }
    };

    // Handle bulk booking counter increment
    const incrementMeal = (type) => {
        if (type === 'veg') setVegCount(vegCount + 1);
        if (type === 'egg') setEggCount(eggCount + 1);
        if (type === 'non-veg') setNonVegCount(nonVegCount + 1);
    };

    // Handle bulk booking counter decrement
    const decrementMeal = (type) => {
        if (type === 'veg' && vegCount > 0) setVegCount(vegCount - 1);
        if (type === 'egg' && eggCount > 0) setEggCount(eggCount - 1);
        if (type === 'non-veg' && nonVegCount > 0) setNonVegCount(nonVegCount - 1);
    };

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className="sidebar-dashboard">
                <div className="sidebar-header">
                    <h1 className="sidebar-title">Admin Panel</h1>
                </div>
                <div className="dashboard-tabs">
                    <button className="tab-dashboard-btn active">
                        <FaTachometerAlt className="tab-icon" />
                        Dashboard
                    </button>
                    <button className="tab-dashboard-btn">
                        <FaFileAlt className="tab-icon" />
                        Report Generation
                    </button>
                    <button className="tab-dashboard-btn">
                        <FaUtensils className="tab-icon" />
                        Menu Change
                    </button>
                </div>
                <div className="dashboard-logout">
                    <button className="logout-dashboard-btn" onClick={handleLogout}>
                        <FaSignOutAlt className="logout-icon" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="main-content-dashboard">
                {<TokenValidation/>}
                {/* Section 2: Total Booking */}
                <div className="dashboard-section">
                    <h2 className="section-heading-dashboard">Total Booking</h2>
                    <button
                        className="total-booking-btn"
                        onClick={() => setShowTotalBooking(!showTotalBooking)}
                    >
                        {showTotalBooking ? 'Hide Total Booking' : 'Show Total Booking'}
                    </button>
                    {showTotalBooking && (
                        <div className="total-booking-counts">
                            <p>Total Veg Bookings: {vegCount}</p>
                            <p>Total Egg Bookings: {eggCount}</p>
                            <p>Total Non-Veg Bookings: {nonVegCount}</p>
                        </div>
                    )}
                </div>

            </div>




<Bulkbooking/>






        </div>
    );
};

export default Dashboard;
