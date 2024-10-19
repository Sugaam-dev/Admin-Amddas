import React, { useState } from 'react';
import '../Styles/dashboard.css';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../Redux/authActions';
import { useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaFileAlt,
  FaUtensils,
  FaSignOutAlt,
  FaBars,
  FaTimes, // Close icon for mobile/large screens
} from 'react-icons/fa';

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to control sidebar visibility

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen); // Toggle the sidebar visibility
  };

  const closeSidebar = () => {
    setSidebarOpen(false); // Close the sidebar
  };

  const home = () => {
    navigate('/home');
  };

  const menu = () => {
    navigate('/home/menu');
  };

  const report = () => {
    navigate('/home/report');
  };

  const bulk=()=>{
    navigate('/home/bulkbooking')
  }

  return (
    <>
      {/* Hamburger menu for all screen sizes */}
      <div className="hamburger-menu" onClick={toggleSidebar}>
        <FaBars style={{marginBottom:"40px",marginLeft:"-20px"}}/>
      </div>

      {/* Sidebar */}
      <div className={`sidebar-dashboard ${sidebarOpen ? 'show' : ''}`}>
        {/* Close icon for all screen sizes */}
        <div className="close-icon" onClick={closeSidebar}>
          <FaTimes />
        </div>
        <div className="sidebar-header">
          <h1 className="sidebar-title">Admin Panel</h1>
        </div>
        <div className="dashboard-tabs">
          <button onClick={home} className="tab-dashboard-btn active">
            <FaTachometerAlt className="tab-icon" />
            Dashboard
          </button>
          <button onClick={bulk} className="tab-dashboard-btn">
            <FaUtensils className="tab-icon" />
            BulkBooking
          </button>
          <button onClick={report} className="tab-dashboard-btn">
            <FaFileAlt className="tab-icon" />
            Report Generation
          </button>
          <button onClick={menu} className="tab-dashboard-btn">
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
    </>
  );
}

export default Sidebar;
