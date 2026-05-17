import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, role }) {
  const isStudent = localStorage.getItem("userEmail") !== null;
  const isClub = localStorage.getItem("clubUserEmail") !== null;

  if (role === 'student' && !isStudent) {
    return <Navigate to="/login" replace />;
  }
  
  if (role === 'club' && !isClub) {
    return <Navigate to="/login" replace />;
  }

  // If role is any (meaning either student or club must be logged in)
  if (role === 'any' && !isStudent && !isClub) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
