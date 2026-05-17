import React from "react";
import "./Dashboard.css"; // Ensure this contains generic button CSS

function Button({ children, variant = "primary", className = "", ...props }) {
  const baseClass = `${variant}-btn`; // e.g primary-btn, danger-btn, success-btn, secondary-btn
  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
