import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import '../Styles/menu.css';
import {jwtDecode} from 'jwt-decode'; // Corrected import
import { useSelector } from 'react-redux';
import { port } from '../port/portno';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Importing Font Awesome Icons
// If you prefer Material Design Icons, use the following line instead:
// import { MdEdit, MdDelete } from 'react-icons/md';

function MenuChange() {
  // Redux Selectors
  const jwtToken = useSelector((state) => state.auth.token);
  const email = useSelector((state) => state.auth.email); // Get the logged-in user's email
  const [error, setError] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [isSunday, setIsSunday] = useState(false);
  const [isTuesday, setIsTuesday] = useState(false);
  const [bookingDay, setBookingDay] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Veg');

  // Decode JWT to get userId
  let decode;
  let userId;

  if (jwtToken) {
    try {
      decode = jwtDecode(jwtToken);
      userId = decode.userId; // Ensure 'userId' exists in the token
    } catch (error) {
      console.error('Error decoding JWT:', error);
      setError('Invalid authentication token.');
    }
  } else {
    console.warn('JWT token is missing.');
    setError('Authentication token is missing.');
  }

  console.log(userId);

  // Helper Functions

  // Determine Booking Day
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

  // Menu Data Mapping
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
    // Sunday: { veg: 8 },
  };

  // Format Date
  const formatDate = (isoString) => {
    if (!isoString) return 'Invalid Date';

    const date = new Date(isoString);
    if (isNaN(date)) return 'Invalid Date';

    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    if (day === 5) {
      // Friday
      date.setDate(date.getDate() + 3); // Next Monday
    } else if (day === 6) {
      // Saturday
      date.setDate(date.getDate() + 2); // Next Monday
    } else {
      date.setDate(date.getDate() + 1); // Next day
    }

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Function to map menuId to menuType
  const getMenuTypeFromMenuId = (menuId) => {
    for (const day in menuDataMap) {
      for (const type in menuDataMap[day]) {
        if (menuDataMap[day][type] === menuId) {
          return type;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    // Determine booking day using the updated logic
    const bookingForDay = determineBookingDay();

    setBookingDay(bookingForDay);
    setIsSunday(new Date().getDay() === 0);
    setIsTuesday(new Date().getDay() === 2);

    if (jwtToken && bookingForDay) {
      axios
        .get(`${port}/api/menus/menu/${bookingForDay}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
          setMenuData(response.data);
          filterItems('Veg', response.data);
          console.log(response.data);
          setError(null);
        })
        .catch((error) => {
          console.error('Error fetching menu data:', error);
          if (error.response && error.response.status === 403) {
            setError('You need to login again.');
          } else {
            setError('Please Login Again');
          }
        });
    }
  }, [jwtToken, email]);

  // Filtering function
  const filterItems = (category, data = menuData) => {
    setActiveFilter(category);
    if (data.length === 0) return;

    let filtered = [];
    let menuId = null;

    if (category === 'Veg') {
      const vegMenu = data.find((menu) => menu.isVeg === 1);
      filtered = vegMenu?.menuItems || [];
      menuId = vegMenu?.menuId || null;
    } else if (category === 'Non-Veg') {
      const nonVegMenu = data.find((menu) => menu.isVeg === 0);
      filtered = nonVegMenu?.menuItems || [];
      menuId = nonVegMenu?.menuId || null;
    } else if (category === 'Egg') {
      const eggMenu = data.find((menu) => menu.isVeg === 2);
      filtered = eggMenu?.menuItems || [];
      menuId = eggMenu?.menuId || null;
    }

    setSelectedMenuId(menuId);
    setFilteredItems(filtered);
  };

  // Handlers for Edit and Delete actions
  const handleEdit = (menuItem) => {
    // Implement your edit logic here
    console.log('Edit menu item:', menuItem);
  };

  const handleDelete = (menuItemId) => {
    // Implement your delete logic here
    console.log('Delete menu item with ID:', menuItemId);
    // Example:
    // axios.delete(`${port}/api/menus/item/${menuItemId}`, { headers: { Authorization: `Bearer ${jwtToken}` } })
    //   .then(response => { /* handle success */ })
    //   .catch(error => { /* handle error */ });
  };

  return (
    <>
      <div className="dd" style={{ display: 'flex' }}>
        <Sidebar />

        <div className="menu-container">
          <h1 className="menu-title">Booking for {bookingDay} Menu</h1>

          {/* Filter Buttons */}
          <div className="filter-buttons">
            <button
              onClick={() => filterItems('Veg')}
              className={`filter-btn veg-btn ${activeFilter === 'Veg' ? 'active-veg' : ''}`}
              disabled={
                isSunday ||
                (menuDataMap[bookingDay] &&
                  Object.keys(menuDataMap[bookingDay]).length === 1 &&
                  !menuDataMap[bookingDay].veg)
              }
              title={
                menuDataMap[bookingDay] &&
                Object.keys(menuDataMap[bookingDay]).length === 1
                  ? 'Only Vegetarian menu is available.'
                  : 'Vegetarian Menu'
              }
            >
              Vegetarian
            </button>
            <button
              onClick={() => filterItems('Egg')}
              className={`filter-btn egg-btn ${activeFilter === 'Egg' ? 'active-egg' : ''}`}
              disabled={!isTuesday || (menuDataMap[bookingDay] && !menuDataMap[bookingDay].egg)}
              title={
                !isTuesday || (menuDataMap[bookingDay] && !menuDataMap[bookingDay].egg)
                  ? 'Egg Menu is not available.'
                  : 'Egg Menu'
              }
            >
              Eggetarian
            </button>
            <button
              onClick={() => filterItems('Non-Veg')}
              className={`filter-btn nonveg-btn ${activeFilter === 'Non-Veg' ? 'active-nonveg' : ''}`}
              disabled={!isTuesday || (menuDataMap[bookingDay] && !menuDataMap[bookingDay].nonVeg)}
              title={
                !isTuesday || (menuDataMap[bookingDay] && !menuDataMap[bookingDay].nonVeg)
                  ? 'Non-Vegetarian Menu is not available.'
                  : 'Non-Vegetarian Menu'
              }
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
                    {/* <FaTrash
                      className="action-icon delete-icon"
                      onClick={() => handleDelete(menuItem.item.itemId)}
                      title="Delete Item"
                    /> */}
                    {/* If using Material Design Icons, replace FaEdit and FaTrash with MdEdit and MdDelete */}
                  </div>
                </div>
              ))
            ) : (
              <>
                <p className="no-items-found">No items found for {activeFilter}</p>
                {error && <p className="no-items-found">{error}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default MenuChange;
