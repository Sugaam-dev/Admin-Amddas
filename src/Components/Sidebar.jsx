import React, { useState, useEffect } from 'react';
import '../Styles/dashboard.css';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../Redux/authActions';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaFileAlt,
  FaUtensils,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to control sidebar visibility
  const [activePath, setActivePath] = useState('/home'); // Initialize with default path

  useEffect(() => {
    // Update activePath when location changes
    setActivePath(location.pathname);
  }, [location.pathname]);

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

  const navigateTo = (path) => {
    navigate(path);
    setActivePath(path);
    closeSidebar();
  };

  return (
    <>
      {/* Hamburger menu for all screen sizes */}
      <div className="hamburger-menu" onClick={toggleSidebar}>
        <FaBars style={{ marginBottom: '40px', marginLeft: '-20px' }} />
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
          <button
            onClick={() => navigateTo('/home')}
            className={`tab-dashboard-btn ${
              activePath === '/home' ? 'active' : ''
            }`}
          >
            <FaTachometerAlt className="tab-icon" />
            Dashboard
          </button>
          <button
            onClick={() => navigateTo('/home/bulkbooking')}
            className={`tab-dashboard-btn ${
              activePath === '/home/bulkbooking' ? 'active' : ''
            }`}
          >
            <FaUtensils className="tab-icon" />
            BulkBooking
          </button>
          <button
            onClick={() => navigateTo('/home/report')}
            className={`tab-dashboard-btn ${
              activePath === '/home/report' ? 'active' : ''
            }`}
          >
            <FaFileAlt className="tab-icon" />
            Report Generation
          </button>
          <button
            onClick={() => navigateTo('/home/menu')}
            className={`tab-dashboard-btn ${
              activePath === '/home/menu' ? 'active' : ''
            }`}
          >
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
