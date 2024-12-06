// src/components/ConfirmDeleteModal.js

import React from 'react';

function ConfirmDeleteModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal confirm-modal">
        <p>{message}</p>
        <div style={{ marginTop: '20px' }}>
          <button className="confirm" onClick={onConfirm}>
            Delete
          </button>
          <button className="cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
