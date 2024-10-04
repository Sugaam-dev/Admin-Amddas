import React from 'react'
import '../Styles/dashboard.css';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../Redux/authActions';
import { useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaFileAlt,
  FaUtensils,
  FaSignOutAlt,
} from 'react-icons/fa';
function Sidebar() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
  
    const handleLogout = () => {
      dispatch(logoutUser());
      navigate('/');
    };

    const home = () => {
     
      navigate('/home');
    };
const menu=()=>{
  navigate('/home/menu')
}
  return (
    <>
            {/* Sidebar */}
            <div className="sidebar-dashboard">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Admin Panel</h1>
        </div>
        <div className="dashboard-tabs">
          <button onClick={home} className="tab-dashboard-btn active">
            <FaTachometerAlt className="tab-icon" />
            Dashboard
          </button>
          <button className="tab-dashboard-btn">
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
  )
}

export default Sidebar
