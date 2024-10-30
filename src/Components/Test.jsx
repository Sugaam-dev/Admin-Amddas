import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import '../Styles/menu.css';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import { useSelector } from 'react-redux';
import { port } from '../port/portno';
import AddFoodItemModal from './MenusChangeModel/AddFoodItemModal';
import AddMenuItemModal from './MenusChangeModel/AddMenuItemModal';

function Test() {
  // Redux Selectors
  const jwtToken = useSelector((state) => state.auth.token);
  const [error, setError] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showAddFoodItemModal, setShowAddFoodItemModal] = useState(false);
  const [showAddMenuItemModal, setShowAddMenuItemModal] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState(null);

  // Decode JWT to get userId
  let userId;
  if (jwtToken) {
    try {
      const decoded = jwtDecode(jwtToken);
      userId = decoded.userId;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      setError('Invalid authentication token.');
    }
  } else {
    console.warn('JWT token is missing.');
    setError('Authentication token is missing.');
  }

  // Fetch Food Items
  useEffect(() => {
    const fetchFoodItems = async () => {
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

    if (jwtToken) {
      fetchFoodItems();
    }
  }, [jwtToken]);

  // Fetch Food Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${port}/api/food-categories`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (jwtToken) {
      fetchCategories();
    }
  }, [jwtToken]);

  // Fetch Menus for Selected Day
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

  // Handle Day Change
  const handleDayChange = (event) => {
    const day = event.target.value;
    setSelectedDay(day);
    fetchMenusForDay(day);
  };

  // Handle Food Item Change
  const handleFoodItemChange = (menuIndex, menuItemIndex, newItemId) => {
    const updatedMenuData = [...menuData];
    const menu = updatedMenuData[menuIndex];
    const menuItem = menu.menuItems[menuItemIndex];

    // Find the new food item
    const newFoodItem = foodItems.find(
      (item) => item.itemId === parseInt(newItemId)
    );

    if (newFoodItem) {
      menuItem.item = newFoodItem;
      setMenuData(updatedMenuData);
    } else {
      alert('Selected food item not found.');
    }
  };

  // Handle Save Menu
  const handleSaveMenu = async (menuId, menuItems) => {
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

  // Get Menu Type from isVeg
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

  // Handle Add Menu Item
  const handleAddMenuItem = (menuId) => {
    setSelectedMenuId(menuId);
    setShowAddMenuItemModal(true);
  };

  // Handle Add Menu Item to Menu
  const handleAddMenuItemToMenu = async (foodItemId) => {
    try {
      const menuItemDTO = {
        item: { itemId: foodItemId },
      };

      const response = await axios.post(
        `${port}/api/menus/${selectedMenuId}/menu-items`,
        menuItemDTO,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      const newMenuItem = response.data;

      // Update the menuData state
      const updatedMenuData = menuData.map((menu) => {
        if (menu.menuId === selectedMenuId) {
          return {
            ...menu,
            menuItems: [...menu.menuItems, newMenuItem],
          };
        }
        return menu;
      });

      setMenuData(updatedMenuData);

      // Close the modal
      setShowAddMenuItemModal(false);

      alert('Menu item added successfully.');
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Failed to add menu item.');
    }
  };

  // Handle Save New Food Item
  const handleSaveNewFoodItem = async (newFoodItem, menuId) => {
    try {
      // Save new food item to the backend
      const response = await axios.post(`${port}/api/food-items`, newFoodItem, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      const savedFoodItem = response.data;

      // Update foodItems state
      setFoodItems([...foodItems, savedFoodItem]);

      // Add the new food item to the selected menu
      const menuItemDTO = {
        item: { itemId: savedFoodItem.itemId },
      };

      const addMenuItemResponse = await axios.post(
        `${port}/api/menus/${menuId}/menu-items`,
        menuItemDTO,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      const newMenuItem = addMenuItemResponse.data;

      // Update menuData state
      const updatedMenuData = menuData.map((menu) => {
        if (menu.menuId === parseInt(menuId)) {
          return {
            ...menu,
            menuItems: [...menu.menuItems, newMenuItem],
          };
        }
        return menu;
      });
      setMenuData(updatedMenuData);

      // Close the modal
      setShowAddFoodItemModal(false);

      alert('Food item added and added to menu successfully.');
    } catch (error) {
      console.error('Error adding food item:', error);
      alert('Failed to add food item.');
    }
  };

  return (
    <>
      <div className="dd" style={{ display: 'flex' }}>
        <Sidebar />

        <div className="menu-container">
          <h1 className="menu-title">Admin Panel - Edit Menus</h1>

          {/* Day Selection */}
          <div>
            <label>Select Day: </label>
            <select value={selectedDay} onChange={handleDayChange}>
              <option value="">-- Select Day --</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
            </select>
          </div>

          {/* Add New Food Item Button */}
          <button onClick={() => setShowAddFoodItemModal(true)}>Add New Food Item</button>

          {/* Display Error Messages */}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {/* Display Loading Indicator */}
          {loading && <p>Loading...</p>}

          {/* Menus Display */}
          {menuData.map((menu, menuIndex) => (
            <div key={menu.menuId} className="menu-card">
              <h2>{getMenuTypeFromIsVeg(menu.isVeg)} for {selectedDay}</h2>
              <table>
                <thead>
                  <tr>
                    <th>Menu Item ID</th>
                    <th>Food Item</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {menu.menuItems.map((menuItem, menuItemIndex) => (
                    <tr key={menuItem.menuItemId}>
                      <td>{menuItem.menuItemId}</td>
                      <td>
                        <select
                          value={menuItem.item.itemId}
                          onChange={(e) =>
                            handleFoodItemChange(menuIndex, menuItemIndex, e.target.value)
                          }
                        >
                          {foodItems
                            .filter((item) => item.isVeg === menu.isVeg)
                            .map((item) => (
                              <option key={item.itemId} value={item.itemId}>
                                {item.itemName}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td>{menuItem.item.category?.categoryName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => handleSaveMenu(menu.menuId, menu.menuItems)}>
                Save Changes for {getMenuTypeFromIsVeg(menu.isVeg)}
              </button>
              <button onClick={() => handleAddMenuItem(menu.menuId)}>
                Add Menu Item
              </button>
            </div>
          ))}

          {/* Add Food Item Modal */}
          {showAddFoodItemModal && (
            <AddFoodItemModal
              onClose={() => setShowAddFoodItemModal(false)}
              onSave={handleSaveNewFoodItem}
              categories={categories}
              menus={menuData}
            />
          )}

          {/* Add Menu Item Modal */}
          {showAddMenuItemModal && (
            <AddMenuItemModal
              onClose={() => setShowAddMenuItemModal(false)}
              onAdd={handleAddMenuItemToMenu}
              menuIsVeg={menuData.find((menu) => menu.menuId === selectedMenuId)?.isVeg}
              foodItems={foodItems}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Test;
