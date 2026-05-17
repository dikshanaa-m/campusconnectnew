import React from "react";
import "./ClubDashboard.css"; // Ensures modal CSS is available globally or we move it

function Modal({ isOpen, onClose, title, children, isLarge = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${isLarge ? "large-modal" : ""}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose} type="button">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
