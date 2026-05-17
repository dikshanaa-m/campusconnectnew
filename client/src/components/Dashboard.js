import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Card from "./Card";
import Button from "./Button";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState("events");
  const [loading, setLoading] = useState(true);

  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) {
      navigate("/");
      return;
    }

    axios.get("http://localhost:5000/api/events")
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });

  }, [userEmail, navigate]);

  // Get only top 3 upcoming events for the preview dashboard
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="dashboard-container">
      <Navbar title="Student Portal" />

      {/* WELCOME CARD */}
      <div className="welcome-card">
        <div className="welcome-content">
          <h1>Welcome back, {userName}! 👋</h1>
          <p>Explore events, join clubs, and make the most of your campus experience.</p>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${tab === 'events' ? 'active' : ''}`}
          onClick={() => { setTab("events"); navigate("/events"); }}
        >
          📅 Events
        </button>
        <button 
          className={`tab-btn ${tab === 'clubs' ? 'active' : ''}`}
          onClick={() => { setTab("clubs"); navigate("/clubs"); }}
        >
          👥 Clubs
        </button>
        <button 
          className={`tab-btn ${tab === 'registrations' ? 'active' : ''}`}
          onClick={() => { setTab("registrations"); navigate("/registrations"); }}
        >
          👤 My Registrations
        </button>
      </div>

      {/* EVENTS PREVIEW */}
      <div className="dashboard-content">
        <div className="section-header">
          <h2>Upcoming Events Preview</h2>
          <button className="view-all-btn" onClick={() => navigate("/events")}>
            View All Events →
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading events...</div>
        ) : upcomingEvents.length === 0 ? (
          <div className="empty-state">No upcoming events currently available.</div>
        ) : (
          <div className="events-grid">
            {upcomingEvents.map(event => (
              <Card key={event._id}>
                <div className="event-img-wrapper">
                  <img src={event.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.title)}&background=random`} alt={event.title} className="event-image" />
                  <div className="event-date-badge">
                    {event.date}
                  </div>
                </div>
                <div className="event-info">
                  <div className="event-club">{event.club}</div>
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-desc">{event.description}</p>
                  
                  <div className="event-details">
                    <span className="detail-item">🕒 {event.time}</span>
                    <span className="detail-item">📍 {event.venue}</span>
                  </div>
                  
                  <div className="event-progress-container">
                    <div className="progress-labels">
                      <span>Registered</span>
                      <span>{event.registered || 0} / {event.capacity || 100}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${Math.min(100, ((event.registered || 0) / (event.capacity || 100)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <Button variant="primary" className="register-btn" onClick={() => navigate("/events")}>
                    Go to Events to Register
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;