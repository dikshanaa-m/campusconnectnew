import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Dashboard.css";
import "./ClubDashboard.css";
import Tasks from "./Tasks";
import Resources from "./Resources";
import Requests from "./Requests";
import Members from "./Members";
import Navbar from "./Navbar";
import Modal from "./Modal";
import { useNavigate } from "react-router-dom";

function ClubDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    capacity: "",
    image: ""
  });

  const clubAuth = localStorage.getItem("clubUserEmail");
  const userRole = localStorage.getItem("userRole");
  const clubUserName = localStorage.getItem("clubUserName") || "Club Admin";
  const storedClubName = localStorage.getItem("clubName");
  
  // Define club object properly using accurate clubName for database queries
  const club = {
    name: storedClubName,
    clubName: storedClubName
  };

  const fetchEvents = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/events/club/${club.clubName}`);
      setEvents(res.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, [club.clubName]);

  useEffect(() => {
    if (!clubAuth) {
      navigate("/");
      return;
    }
    fetchEvents();
  }, [clubAuth, navigate, fetchEvents]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModalForAdd = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      capacity: "",
      image: ""
    });
    setIsEventModalOpen(true);
  };

  const openModalForEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      date: event.date || "",
      time: event.time || "",
      venue: event.venue || "",
      capacity: event.capacity || "",
      image: event.image || ""
    });
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      club: club.clubName,
      capacity: Number(formData.capacity)
    };

    try {
      if (editingEvent) {
        await axios.put(`http://localhost:5000/api/events/${editingEvent._id}`, payload);
        alert("Event updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/events", payload);
        alert("Event created successfully!");
      }
      setIsEventModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event");
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar title="Club Dashboard" />

      {/* WELCOME CARD */}
      <div className="welcome-card club-welcome">
        <div className="welcome-content">
          <h1>Welcome, {clubUserName}! 👋</h1>
          <p>Manage your club's presence, organize events, delegate tasks, and allocate resources efficiently.</p>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${tab === 'events' ? 'active' : ''}`}
          onClick={() => setTab("events")}
        >
          📅 Event Management
        </button>
        <button 
          className={`tab-btn ${tab === 'tasks' ? 'active' : ''}`}
          onClick={() => setTab("tasks")}
        >
          📋 Tasks
        </button>
        <button 
          className={`tab-btn ${tab === 'resources' ? 'active' : ''}`}
          onClick={() => setTab("resources")}
        >
          📦 Resources
        </button>
        {userRole === "club_admin" && (
          <>
            <button 
              className={`tab-btn ${tab === 'members' ? 'active' : ''}`}
              onClick={() => setTab("members")}
            >
              👥 Members
            </button>
            <button 
              className={`tab-btn ${tab === 'requests' ? 'active' : ''}`}
              onClick={() => setTab("requests")}
            >
              📩 Requests
            </button>
          </>
        )}
      </div>

      <div className="dashboard-content club-dashboard-content">
        {/* ================= EVENTS TAB ================= */}
        {tab === "events" && (
          <div className="section-content">
            <div className="section-header">
              <div>
                <h2>Event Management</h2>
                <p style={{ color: '#94a3b8', margin: 0 }}>Create and manage your upcoming events</p>
              </div>
              <button className="primary-btn" onClick={openModalForAdd}>
                + Create New Event
              </button>
            </div>

            {events.length === 0 ? (
              <div className="empty-state">No events available. Create one to get started.</div>
            ) : (
              <div className="events-grid">
                {events.map((event) => (
                  <div className="event-card" key={event._id}>
                    <div className="event-img-wrapper">
                      <img 
                        src={event.image || `https://ui-avatars.com/api/?name=${event.title}&background=random`} 
                        alt={event.title} 
                        className="event-image" 
                      />
                      <div className="event-date-badge">
                        {event.date}
                      </div>
                    </div>
                    
                    <div className="event-info">
                      <h3 className="event-title">{event.title}</h3>
                      <p className="event-desc club-desc">{event.description}</p>
                      
                      <div className="event-details club-members-container" style={{ gap: '12px' }}>
                        <span className="detail-item">🕒 {event.time}</span>
                        <span className="detail-item">📍 {event.venue}</span>
                        <span className="detail-item">👥 Capacity: {event.capacity}</span>
                      </div>

                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => openModalForEdit(event)}>Edit</button>
                        <button className="delete-btn" onClick={() => deleteEvent(event._id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TASKS TAB ================= */}
        {tab === "tasks" && <Tasks club={club} />}

        {/* ================= RESOURCES TAB ================= */}
        {tab === "resources" && <Resources club={club} />}

        {/* ================= REQUESTS TAB ================= */}
        {tab === "requests" && userRole === "club_admin" && <Requests club={club} />}
        {tab === "requests" && userRole !== "club_admin" && (
          <div className="empty-state">
            <h3>Access Denied</h3>
            <p>Only club administrators can access this protected page.</p>
          </div>
        )}

        {/* ================= MEMBERS TAB ================= */}
        {tab === "members" && userRole === "club_admin" && <Members club={club} />}
        {tab === "members" && userRole !== "club_admin" && (
          <div className="empty-state">
            <h3>Access Denied</h3>
            <p>Only club administrators can access this protected page.</p>
          </div>
        )}
      </div>

      {/* EVENT MODAL */}
      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title={editingEvent ? "Edit Event" : "Create New Event"} isLarge={true}>
        <form onSubmit={handleEventSubmit} className="modal-form">
          <div className="form-group">
            <label>Event Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Venue / Location</label>
              <input type="text" name="venue" value={formData.venue} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input type="number" name="capacity" min="1" value={formData.capacity} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Image URL (Optional)</label>
            <input type="url" name="image" value={formData.image} onChange={handleInputChange} placeholder="https://example.com/image.jpg" />
          </div>
          <button type="submit" className="submit-btn">{editingEvent ? "Update Event" : "Publish Event"}</button>
        </form>
      </Modal>
    </div>
  );
}

export default ClubDashboard;