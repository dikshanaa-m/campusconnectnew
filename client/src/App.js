import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Events from "./components/Events";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Clubs from "./components/Clubs";
import MyRegistrations from "./components/MyRegistrations";
import ClubDashboard from "./components/ClubDashboard";
import Tasks from "./components/Tasks";
import Resources from "./components/Resources";
import ClubRegister from "./components/ClubRegister";
import ProtectedRoute from "./components/ProtectedRoute";
import axios from "axios";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/club-register" element={<ClubRegister />} />
        
        {/* Student Routes */}
        <Route path="/dashboard" element={<ProtectedRoute role="student"><Dashboard /></ProtectedRoute>} />
        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><Dashboard /></ProtectedRoute>} />
        
        <Route path="/events" element={<ProtectedRoute role="student"><Events /></ProtectedRoute>} />
        <Route path="/student/events" element={<ProtectedRoute role="student"><Events /></ProtectedRoute>} />
        
        <Route path="/clubs" element={<ProtectedRoute role="student"><Clubs /></ProtectedRoute>} />
        <Route path="/student/clubs" element={<ProtectedRoute role="student"><Clubs /></ProtectedRoute>} />
        
        <Route path="/registrations" element={<ProtectedRoute role="student"><MyRegistrations /></ProtectedRoute>} />
        <Route path="/student/registrations" element={<ProtectedRoute role="student"><MyRegistrations /></ProtectedRoute>} />
        
        {/* Club Member Routes */}
        <Route path="/club-dashboard" element={<ProtectedRoute role="club"><ClubDashboard /></ProtectedRoute>} />
        <Route path="/club/dashboard" element={<ProtectedRoute role="club"><ClubDashboard /></ProtectedRoute>} />
        
        <Route path="/club/tasks" element={<ProtectedRoute role="club"><Tasks /></ProtectedRoute>} />
        <Route path="/club/resources" element={<ProtectedRoute role="club"><Resources /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;