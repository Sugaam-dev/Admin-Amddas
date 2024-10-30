import React, { useState } from 'react';

function AddFoodItemModal({ onClose, onSave, categories, menus }) {
  const [itemName, setItemName] = useState('');
  const [isVeg, setIsVeg] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [menuId, setMenuId] = useState('');

  const handleSave = () => {
    if (!itemName || !categoryId || !menuId) {
      alert('Please fill all required fields.');
      return;
    }

    const newFoodItem = {
      itemName,
      isVeg,
      isFullDish: true, // Hardcoded
      price: 0.0,        // Hardcoded
      category: { categoryId: parseInt(categoryId) },
    };

    onSave(newFoodItem, menuId);
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

  return (
    <div className="modal">
      <h2>Add New Food Item</h2>
      <label>
        Food Name:
        <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} />
      </label>
      <br />
      <label>
        Is Veg:
        <select value={isVeg} onChange={(e) => setIsVeg(parseInt(e.target.value))}>
          <option value={1}>Veg</option>
          <option value={0}>Non-Veg</option>
          <option value={2}>Egg</option>
        </select>
      </label>
      <br />
      <label>
        Category:
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">-- Select Category --</option>
          {categories.map((category) => (
            <option key={category.categoryId} value={category.categoryId}>
              {category.categoryName}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Add to Menu:
        <select value={menuId} onChange={(e) => setMenuId(e.target.value)}>
          <option value="">-- Select Menu --</option>
          {menus.map((menu) => (
            <option key={menu.menuId} value={menu.menuId}>
              {getMenuTypeFromIsVeg(menu.isVeg)} Menu
            </option>
          ))}
        </select>
      </label>
      <br />
      <button onClick={handleSave}>Save and Add to Menu</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}

export default AddFoodItemModal;
