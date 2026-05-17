import React from "react";
import "./Dashboard.css"; // Assumes .event-card and other generic styles are here

function Card({ children, className = "" }) {
  // We use event-card as the base to leverage the neat hover animations
  return (
    <div className={`event-card ${className}`}>
      {children}
    </div>
  );
}

export default Card;
