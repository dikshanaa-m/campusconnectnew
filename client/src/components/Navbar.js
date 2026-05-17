import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar({ title = "Student Portal" }) {
  const navigate = useNavigate();
  
  // Determine if it's a student or club member logged in
  const role = localStorage.getItem("userRole");
  const isStudent = role === "student";

  const userName = isStudent 
    ? localStorage.getItem("userName") || localStorage.getItem("userEmail")?.split("@")[0]
    : localStorage.getItem("clubUserName") || "Club Admin";
    
  const displayRole = isStudent ? "Student" : (localStorage.getItem("clubName") || "Club Administrator");

  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("clubUserName");
    localStorage.removeItem("clubUserEmail");
    localStorage.removeItem("clubName");
    localStorage.removeItem("clubId");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>Campus Connect</h2>
        <span className="badge">{title}</span>
      </div>
      
      <div className="nav-user">
        <div className="user-details">
          <span className="user-name">{userName}</span>
          <span className="user-email">{displayRole}</span>
        </div>
        <div className="nav-avatar">
          {userName ? userName.charAt(0).toUpperCase() : 'U'}
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
