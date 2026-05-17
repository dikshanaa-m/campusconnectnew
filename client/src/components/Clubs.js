import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Button from "./Button";
import "./Dashboard.css";
import "./Clubs.css";

function Clubs() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [requestStatuses, setRequestStatuses] = useState({});

  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    if (!userEmail) {
      navigate("/");
      return;
    }

    const fetchMyRequests = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/clubs/myrequests?email=${encodeURIComponent(userEmail)}`);
        const statuses = {};
        res.data.forEach(req => {
          statuses[req.clubId.toString()] = req.status;
        });
        setRequestStatuses(statuses);
      } catch (error) {
        console.error("Error fetching my requests:", error);
      }
    };

    const fetchClubs = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/clubs");
        setClubs(res.data);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
    fetchMyRequests();
  }, [userEmail, navigate]);

  const requestJoinClub = async (club) => {
    try {
      await axios.post("http://localhost:5000/api/clubs/request", {
        clubId: club._id,
        clubName: club.name, // The backend needs exact match
        studentEmail: userEmail,
        studentName: userName || userEmail.split("@")[0]
      });

      alert("Request sent to club head");
      setRequestStatuses(prev => ({ ...prev, [club._id.toString()]: "pending" }));
    } catch (error) {
      console.error("Error sending request:", error);
      alert(error.response?.data?.message || "Error sending request");
      if (error.response?.data?.message.includes("already have a pending request")) {
        setRequestStatuses(prev => ({ ...prev, [club._id.toString()]: "pending" }));
      }
    }
  };

  const filteredClubs = clubs.filter(
    (club) =>
      club.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <Navbar title="Clubs" />

      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Campus Clubs</h1>
            <p className="page-subtitle">Join clubs and connect with like-minded students to enhance your campus experience.</p>
          </div>
          
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search clubs by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading clubs...</div>
        ) : filteredClubs.length === 0 ? (
          <div className="empty-state">No clubs found matching your search.</div>
        ) : (
          <div className="events-grid">
            {filteredClubs.map((club) => {
              const isMember = club.members?.includes(userEmail);
              const requestStatus = requestStatuses[club._id.toString()];
              
              let buttonText = "Join Club";
              let buttonDisabled = false;
              let buttonStyle = {};

              if (isMember || requestStatus === "approved") {
                buttonText = "Member";
                buttonDisabled = true;
                buttonStyle = { backgroundColor: 'transparent', color: '#10b981', borderColor: '#10b981', borderWidth: '1px', borderStyle: 'solid' };
              } else if (requestStatus === "pending") {
                buttonText = "Request Sent (Pending)";
                buttonDisabled = true;
                buttonStyle = { backgroundColor: 'transparent', color: '#f59e0b', borderColor: '#f59e0b', borderWidth: '1px', borderStyle: 'solid' };
              } else if (requestStatus === "rejected") {
                buttonText = "Rejected";
                buttonDisabled = true;
                buttonStyle = { backgroundColor: 'transparent', color: '#ef4444', borderColor: '#ef4444', borderWidth: '1px', borderStyle: 'solid' };
              }
              
              return (
                <div className="event-card" key={club._id}>
                  <div className="event-img-wrapper">
                    <img 
                      src={club.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(club.name)}&background=random`} 
                      alt={club.name} 
                      className="event-image" 
                    />
                    {club.category && (
                      <div className="event-date-badge club-category-badge">
                        {club.category}
                      </div>
                    )}
                  </div>
                  
                  <div className="event-info">
                    <h3 className="event-title">{club.name}</h3>
                    <p className="event-desc club-desc">{club.description}</p>
                    
                    <div className="event-details club-members-container">
                      <div className="members-count">
                        <span className="members-icon">👥</span>
                        <span>{club.members?.length || 0} Members</span>
                      </div>
                    </div>

                    <Button 
                      variant="primary"
                      className="register-btn" 
                      onClick={() => requestJoinClub(club)}
                      disabled={buttonDisabled}
                      style={buttonStyle}
                    >
                      {buttonText}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Clubs;