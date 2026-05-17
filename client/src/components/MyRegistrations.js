import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Dashboard.css";

function MyRegistrations() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem("userEmail");

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/registrations?email=${userEmail}`);
      setRegistrations(res.data);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      navigate("/");
      return;
    }
    fetchRegistrations();
  }, [userEmail, navigate, fetchRegistrations]);

  const cancelRegistration = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel your registration?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/registrations?eventId=${eventId}&studentEmail=${userEmail}`);
      alert("Registration cancelled successfully");
      fetchRegistrations(); // Refresh to update UI
    } catch (error) {
      console.error("Error cancelling registration:", error);
      alert(error.response?.data?.message || "Failed to cancel registration");
    }
  };

  // We want to extract only the unique event objects from the populated registrations
  const registeredEvents = registrations.map(r => r.eventId).filter(Boolean);
  
  // Ensure uniqueness in case of duplicate registrations for some reason
  const uniqueEvents = Array.from(new Map(registeredEvents.map(e => [e._id, e])).values());

  return (
    <div className="dashboard-container">
      <Navbar title="Registrations" />

      <div className="dashboard-content">
        <div className="page-header" style={{ marginBottom: "30px" }}>
          <div>
            <h1 className="page-title">My Registrations</h1>
            <p className="page-subtitle">Track and manage the events you're planning to attend.</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading your registrations...</div>
        ) : uniqueEvents.length === 0 ? (
          <div className="empty-state">
            <h3>You have not registered for any events yet.</h3>
            <p style={{ marginTop: "10px", color: "#64748b" }}>Go to the Events page to explore and join upcoming events.</p>
            <button 
              className="register-btn" 
              style={{ width: "auto", padding: "10px 24px", marginTop: "20px" }}
              onClick={() => navigate("/events")}
            >
              Explore Events
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {uniqueEvents.map((event) => (
              <div className="event-card" key={event._id}>
                <div className="event-img-wrapper">
                  <img 
                    src={event.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.title)}&background=random`} 
                    alt={event.title} 
                    className="event-image" 
                  />
                  <div className="event-date-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.9)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                    ✓ Registered
                  </div>
                </div>
                
                <div className="event-info">
                  <div className="event-club">{event.club || "Campus Event"}</div>
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-desc club-desc">{event.description}</p>
                  
                  <div className="event-details club-members-container" style={{ gap: '12px' }}>
                    <span className="detail-item">📅 {event.date}</span>
                    <span className="detail-item">🕒 {event.time}</span>
                    <span className="detail-item">📍 {event.venue}</span>
                  </div>

                  <button 
                    className="logout-btn" 
                    style={{ width: "100%", marginTop: "auto", textAlign: "center" }}
                    onClick={() => cancelRegistration(event._id)}
                  >
                    Cancel Registration
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRegistrations;