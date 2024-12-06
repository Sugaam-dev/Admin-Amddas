// src/components/Test.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import '../Styles/menu.css';
import { useSelector } from 'react-redux';
import { port } from '../port/portno';

import { FaPlus, FaTrash } from 'react-icons/fa';

function Test() {
  // Retrieve auth state from Redux
  const reduxAuth = useSelector((state) => state.auth);
  const jwtToken = reduxAuth.token ? reduxAuth.token.replace(/^"|"$/g, '') : null;

  const [error, setError] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');

  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchFoodItems = async () => {
      if (!jwtToken) {
        setError('Please log in to access this page.');
        return;
      }
      try {
        const response = await axios.get(`${port}/api/food-items`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        setFoodItems(response.data);
      } catch (error) {
        console.error('Error fetching food items:', error);
        setError('Failed to fetch food items.');
      }
    };

    fetchFoodItems();
  }, [jwtToken]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!jwtToken) return;
      try {
        const response = await axios.get(`${port}/api/food-categories`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to fetch categories.');
      }
    };

    fetchCategories();
  }, [jwtToken]);

  const fetchMenusForDay = async (day) => {
    setLoading(true);
    try {
      const response = await axios.get(`${port}/api/menus/menu/${day}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      setMenuData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching menu data:', error);
      setError('Failed to fetch menus.');
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (event) => {
    const day = event.target.value;
    setSelectedDay(day);
    if (day) {
      fetchMenusForDay(day);
    } else {
      setMenuData([]);
    }
  };

  const handleFoodItemChange = (menuIndex, menuItemIndex, newItemId) => {
    const updatedMenuData = [...menuData];
    const menu = updatedMenuData[menuIndex];
    const menuItem = menu.menuItems[menuItemIndex];

    const newFoodItem = foodItems.find(
      (item) => item.itemId === parseInt(newItemId, 10)
    );

    if (newFoodItem) {
      menuItem.item = newFoodItem;
      setMenuData(updatedMenuData);
    } else {
      alert('Selected food item not found.');
    }
  };

  const handleSaveMenu = async (menuId, menuItems) => {
    if (!jwtToken) {
      setError('Please log in to access this page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const menuItemDTOs = menuItems.map((menuItem) => ({
        menuItemId: menuItem.menuItemId,
        menu: { menuId: menuId },
        item: { itemId: menuItem.item.itemId },
      }));

      await axios.put(`${port}/api/menus/${menuId}/menu-items`, menuItemDTOs, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      alert('Menu updated successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to update menu.');
    } finally {
      setLoading(false);
    }
  };

  // Directly delete menu item from UI
  const handleDeleteMenuItem = (menuId, menuItemId) => {
    const updatedMenuData = menuData.map((menu) => {
      if (menu.menuId === menuId) {
        return {
          ...menu,
          menuItems: menu.menuItems.filter((mi) => mi.menuItemId !== menuItemId),
        };
      }
      return menu;
    });

    setMenuData(updatedMenuData);
  };

  const getMenuTypeFromIsVeg = (isVeg) => {
    switch (isVeg) {
      case 1:
        return 'Vegetarian Menu';
      case 0:
        return 'Non-Vegetarian Menu';
      case 2:
        return 'Eggetarian Menu';
      default:
        return 'Unknown Menu Type';
    }
  };

  // Directly add a new empty menu item row with a unique ID and empty selection
  const handleAddMenuItem = (menuId) => {
    const updatedMenuData = menuData.map((menu) => {
      if (menu.menuId === menuId) {
        // Generate a new unique menuItemId locally
        const existingIds = menu.menuItems.map((mi) => mi.menuItemId);
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        const newMenuItemId = maxId + 1;

        // Create a placeholder menuItem with default item properties
        const newMenuItem = {
          menuItemId: newMenuItemId,
          item: {
            itemId: '',
            itemName: 'Select Item',
            isVeg: menu.isVeg, // default assumption based on menu type
            category: { categoryName: '' },
          },
        };

        return {
          ...menu,
          menuItems: [...menu.menuItems, newMenuItem],
        };
      }
      return menu;
    });

    setMenuData(updatedMenuData);
  };

  return (
    <>
      <div className="dd" style={{ display: 'flex' }}>
        <Sidebar />

        <div className="menu-container">
          <h1 className="menu-title">Admin Panel - Edit Menus</h1>

          {!jwtToken && <p>Please log in to access this page.</p>}

          {jwtToken && (
            <>
              {/* Day Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="day-select">Select Day: </label>
                <select
                  id="day-select"
                  value={selectedDay}
                  onChange={handleDayChange}
                  style={{ marginLeft: '10px' }}
                >
                  <option value="">-- Select Day --</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                </select>
              </div>

              {error && <p style={{ color: 'red' }}>{error}</p>}
              {loading && <p>Loading...</p>}

              {menuData.map((menu, menuIndex) => (
                <div key={menu.menuId} className="menu-card" style={{ marginBottom: '30px' }}>
                  <h2>
                    {getMenuTypeFromIsVeg(menu.isVeg)} for {selectedDay}
                  </h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Menu Item ID</th>
                        <th>Food Item</th>
                        <th>Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menu.menuItems.map((menuItem, menuItemIndex) => (
                        <tr key={menuItem.menuItemId}>
                          <td>{menuItem.menuItemId}</td>
                          <td>
                            <select
                              value={menuItem.item.itemId || ''}
                              onChange={(e) =>
                                handleFoodItemChange(menuIndex, menuItemIndex, e.target.value)
                              }
                            >
                              <option value="">-- Select Food Item --</option>
                              {foodItems.map((item) => {
                                // Filter items by menu type if needed
                                return (
                                  <option key={item.itemId} value={item.itemId}>
                                    {item.itemName} (
                                    {item.isVeg === 1
                                      ? 'Veg'
                                      : item.isVeg === 0
                                      ? 'Non-Veg'
                                      : 'Egg'}
                                    )
                                  </option>
                                );
                              })}
                            </select>
                          </td>
                          <td>
                            {menuItem.item.category?.categoryName || ''}
                            {menuItem.item.isVeg !== undefined && (
                              <> ({menuItem.item.isVeg === 1 ? 'Veg' : menuItem.item.isVeg === 0 ? 'Non-Veg' : 'Egg'})</>
                            )}
                          </td>
                          <td>
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteMenuItem(menu.menuId, menuItem.menuItemId)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'red',
                                fontSize: '1.2em',
                              }}
                              title="Delete Menu Item"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={() => handleSaveMenu(menu.menuId, menu.menuItems)}
                      style={{ marginRight: '10px' }}
                    >
                      Save Changes for {getMenuTypeFromIsVeg(menu.isVeg)}
                    </button>
                    {/* Add Menu Item Button */}
                    <button onClick={() => handleAddMenuItem(menu.menuId)}>
                      <FaPlus /> Add Menu Item
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Test;
