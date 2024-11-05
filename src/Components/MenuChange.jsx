import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import '../Styles/menu.css';
import {jwtDecode} from 'jwt-decode'; // Corrected import
import { useSelector } from 'react-redux';
import { port } from '../port/portno';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Calender from './Cal';

function MenuChange() {
  // Redux Selectors
  const jwtToken = useSelector((state) => state.auth.token);
  const email = useSelector((state) => state.auth.email);

  // State Variables
  const [error, setError] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [bookingDay, setBookingDay] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null); // Initialize to null

  // Decode JWT to get userId
  let decode;
  let userId;

  if (jwtToken) {
    try {
      decode = jwtDecode(jwtToken);
      userId = decode.userId;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      setError('Invalid authentication token.');
    }
  } else {
    console.warn('JWT token is missing.');
    setError('Authentication token is missing.');
  }

  // Menu Data Mapping
  const menuDataMap = {
    Monday: { veg: 1 },
    Tuesday: { veg: 2 },
    Wednesday: { veg: 3, nonVeg: 4, egg: 5 },
    Thursday: { veg: 6 },
    Friday: { veg: 7 },
  };

  // Function to Fetch Menu Data
  const fetchMenuData = async (bookingForDay) => {
    if (jwtToken && bookingForDay) {
      try {
        const response = await axios.get(`${port}/api/menus/menu/${bookingForDay}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        setMenuData(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching menu data:', error);
        setError(
          error.response?.status === 403 ? 'You need to login again.' : 'Please Login Again'
        );
      }
    }
  };

  // Derived Variable for isWednesday
  const isWednesday = bookingDay === 'Wednesday';

  // useEffect to set activeFilter when bookingDay changes
  useEffect(() => {
    if (bookingDay && menuData.length > 0) {
      setActiveFilter('Veg'); // Set Veg as default filter
      applyFilter('Veg');
      console.log(`Booking day set to ${bookingDay}. Veg filter applied by default.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingDay]); // **Only depend on bookingDay**

  // Function to handle date selection from the calendar
  const handleDateSelection = (selectedDateFromCal) => {
    const selectedDayName = new Date(selectedDateFromCal).toLocaleDateString('en-US', {
      weekday: 'long',
    });
    setSelectedDate(selectedDateFromCal);
    setBookingDay(selectedDayName);
    console.log(`Date selected: ${selectedDateFromCal} (${selectedDayName})`);
    fetchMenuData(selectedDayName);
  };

  // Function to apply filter based on category
  const applyFilter = (category) => {
    let filtered = [];
    let menuId = null;

    if (menuData.length > 0) {
      if (category === 'Veg') {
        const vegMenu = menuData.find((menu) => menu.isVeg === 1);
        filtered = vegMenu?.menuItems || [];
        menuId = vegMenu?.menuId || null;
      } else if (category === 'Non-Veg') {
        const nonVegMenu = menuData.find((menu) => menu.isVeg === 0);
        filtered = nonVegMenu?.menuItems || [];
        menuId = nonVegMenu?.menuId || null;
      } else if (category === 'Egg') {
        const eggMenu = menuData.find((menu) => menu.isVeg === 2);
        filtered = eggMenu?.menuItems || [];
        menuId = eggMenu?.menuId || null;
      }
    }

    setSelectedMenuId(menuId);
    setFilteredItems(filtered);
    console.log(`Filter applied: ${category}`);
  };

  // Function to handle filter button clicks
  const filterItems = (category) => {
    setActiveFilter(category);
    applyFilter(category);
  };

  // Handlers for Edit and Delete actions
  const handleEdit = (menuItem) => {
    console.log('Edit menu item:', menuItem);
    // Implement edit functionality here
  };

  const handleDelete = (menuItemId) => {
    console.log('Delete menu item with ID:', menuItemId);
    // Implement delete functionality here
  };

  return (
    <div className="dd" style={{ display: 'flex' }}>
      <Sidebar />

      <div className="menu-container">
        <h1 className="menu-title">Booking for {bookingDay || 'Select a Day'} Menu</h1>

        {/* Calendar Component for Date Selection */}
        <Calender passdata={handleDateSelection} />

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button
            onClick={() => filterItems('Veg')}
            className={`filter-btn veg-btn ${activeFilter === 'Veg' ? 'active-veg' : ''}`}
            disabled={!menuDataMap[bookingDay]?.veg}
            title={
              menuDataMap[bookingDay]?.veg ? 'Vegetarian Menu' : 'Only Vegetarian menu is available.'
            }
            aria-pressed={activeFilter === 'Veg'}
          >
            Vegetarian
          </button>
          <button
            onClick={() => filterItems('Egg')}
            className={`filter-btn egg-btn ${activeFilter === 'Egg' ? 'active-egg' : ''}`}
            disabled={!isWednesday || !menuDataMap[bookingDay]?.egg}
            title={
              isWednesday && menuDataMap[bookingDay]?.egg
                ? 'Eggetarian Menu'
                : 'Egg Menu is not available.'
            }
            aria-pressed={activeFilter === 'Egg'}
          >
            Eggetarian
          </button>
          <button
            onClick={() => filterItems('Non-Veg')}
            className={`filter-btn nonveg-btn ${
              activeFilter === 'Non-Veg' ? 'active-nonveg' : ''
            }`}
            disabled={!isWednesday || !menuDataMap[bookingDay]?.nonVeg}
            title={
              isWednesday && menuDataMap[bookingDay]?.nonVeg
                ? 'Non-Vegetarian Menu'
                : 'Non-Vegetarian Menu is not available.'
            }
            aria-pressed={activeFilter === 'Non-Veg'}
          >
            Non-Vegetarian
          </button>
        </div>

        {/* Menu List */}
        <div className="menu-list">
          {filteredItems.length > 0 ? (
            filteredItems.map((menuItem) => (
              <div key={menuItem.item.itemId} className="menu-item-card">
                <div className="menu-item-details">
                  <h2 className="item-name">{menuItem.item.itemName}</h2>
                  <p className="item-category">
                    Category: {menuItem.item.category.categoryName}
                  </p>
                </div>
                <div className="menu-item-actions">
                  <FaEdit
                    className="action-icon edit-icon"
                    onClick={() => handleEdit(menuItem)}
                    title="Edit Item"
                  />
                  {/* Uncomment below line to enable delete functionality */}
                  {/* <FaTrash
                    className="action-icon delete-icon"
                    onClick={() => handleDelete(menuItem.item.itemId)}
                    title="Delete Item"
                  /> */}
                </div>
              </div>
            ))
          ) : (
            <>
              <p className="no-items-found">
                {activeFilter
                  ? `No items found for ${activeFilter}`
                  : 'Please select a filter to view menu items.'}
              </p>
              {error && <p className="no-items-found">{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MenuChange;
