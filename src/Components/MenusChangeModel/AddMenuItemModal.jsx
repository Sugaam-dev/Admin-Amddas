import React, { useState } from 'react';

function AddMenuItemModal({ onClose, onAdd, menuIsVeg, foodItems }) {
  const [selectedFoodItemId, setSelectedFoodItemId] = useState('');

  const handleAdd = () => {
    if (!selectedFoodItemId) {
      alert('Please select a food item.');
      return;
    }

    onAdd(parseInt(selectedFoodItemId));
  };

  return (
    <div className="modal">
      <h2>Add Menu Item</h2>
      <label>
        Select Food Item:
        <select value={selectedFoodItemId} onChange={(e) => setSelectedFoodItemId(e.target.value)}>
          <option value="">-- Select Food Item --</option>
          {foodItems
            .filter((item) => item.isVeg === menuIsVeg)
            .map((item) => (
              <option key={item.itemId} value={item.itemId}>
                {item.itemName}
              </option>
            ))}
        </select>
      </label>
      <br />
      <button onClick={handleAdd}>Add to Menu</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}

export default AddMenuItemModal;
