import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Dashboard.css";
import "./Events.css";

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) {
      navigate("/");
      return;
    }

    fetchEvents();
  }, [userEmail, navigate]);
  
  const fetchEvents = () => {
    setLoading(true);
    axios.get("http://localhost:5000/api/events")
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }

  const registerEvent = (id) => {
    axios.post("http://localhost:5000/api/registrations", {
      eventId: id,
      studentEmail: userEmail
    })
    .then(res => {
      alert("Registered Successfully!");
      fetchEvents(); // refresh to show updated capacity
    })
    .catch(err => {
      console.error("Error registering:", err);
      alert(err.response?.data?.message || "Registration failed");
    });
  };
  
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <Navbar title="Events" />

      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">All Events</h1>
            <p className="page-subtitle">Discover and register for upcoming campus events and activities.</p>
          </div>
          
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search events by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
           <div className="loading-state">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">No events found matching your search.</div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map(event => (
              <div className="event-card" key={event._id}>
                <div className="event-img-wrapper">
                  <img 
                    src={event.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.title)}&background=random`} 
                    alt={event.title} 
                    className="event-image" 
                  />
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

                  <button 
                    className="register-btn" 
                    onClick={() => registerEvent(event._id)}
                    disabled={(event.registered || 0) >= (event.capacity || 100)}
                  >
                    {(event.registered || 0) >= (event.capacity || 100) ? 'Event Full' : 'Register Now'}
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

export default Events;