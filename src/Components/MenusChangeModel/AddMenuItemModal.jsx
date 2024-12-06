// src/components/MenusChangeModel/AddMenuItemModal.js

import React, { useState } from 'react';

function AddMenuItemModal({ onClose, onAdd, menuIsVeg, foodItems }) {
  const [selectedFoodItemId, setSelectedFoodItemId] = useState('');

  const handleAdd = () => {
    if (!selectedFoodItemId) {
      alert('Please select a food item.');
      return;
    }

    onAdd(parseInt(selectedFoodItemId, 10));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Menu Item</h2>
        <label>
          Select Food Item:
          <select
            value={selectedFoodItemId}
            onChange={(e) => setSelectedFoodItemId(e.target.value)}
          >
            <option value="">-- Select Food Item --</option>
            {foodItems.map((item) => (
              <option key={item.itemId} value={item.itemId}>
                {item.itemName} ({item.isVeg === 1 ? 'Veg' : item.isVeg === 0 ? 'Non-Veg' : 'Egg'})
              </option>
            ))}
          </select>
        </label>
        <br />
        <button onClick={handleAdd} style={{ marginRight: '10px' }}>
          Add to Menu
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default AddMenuItemModal;
