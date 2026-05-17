import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Dashboard.css";

function Requests({ club }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const clubName = club?.clubName || "Club";

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const clubId = localStorage.getItem("clubId");
      let url = `http://localhost:5000/api/clubs/requests`;
      if (clubId) {
        url += `?clubId=${clubId}`;
      } else {
        url += `?clubName=${encodeURIComponent(clubName)}`;
      }
      const token = localStorage.getItem("token");
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  }, [clubName]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id) => {
    try {
      const clubId = localStorage.getItem("clubId");
      const role = localStorage.getItem("userRole");
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/clubs/requests/${id}/approve`, { clubId, clubName, role }, { headers: { Authorization: `Bearer ${token}` } });
      fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request");
    }
  };

  const handleReject = async (id) => {
    try {
      const clubId = localStorage.getItem("clubId");
      const role = localStorage.getItem("userRole");
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/clubs/requests/${id}/reject`, { clubId, clubName, role }, { headers: { Authorization: `Bearer ${token}` } });
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "approved": return "#10b981"; // green
      case "rejected": return "#ef4444"; // red
      default: return "#f59e0b"; // yellow for pending
    }
  };

  return (
    <div className="section-content">
      <div className="section-header">
        <div>
          <h2>Join Requests</h2>
          <p style={{ color: '#94a3b8', margin: 0 }}>Review student applications to join {clubName}</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">No join requests available at this time.</div>
      ) : (
        <div className="list-container">
          {requests.map((req) => (
            <div className="list-item" key={req._id}>
              <div className="item-info">
                <h3>{req.studentName}</h3>
                <p>{req.studentEmail}</p>
                <div className="item-meta">
                  <span>📅 Requested: {new Date(req.date).toLocaleDateString()}</span>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '8px', 
                    background: 'rgba(15, 23, 42, 0.4)',
                    color: getStatusColor(req.status),
                    border: `1px solid ${getStatusColor(req.status)}`,
                    textTransform: 'capitalize'
                  }}>
                    {req.status}
                  </span>
                </div>
              </div>
              <div className="item-actions">
                {req.status === 'pending' && (
                  <>
                    <button className="edit-btn" style={{ 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      color: '#10b981', 
                      borderColor: 'rgba(16, 185, 129, 0.2)' 
                    }} onClick={() => handleApprove(req._id)}>
                      ✓ Approve
                    </button>
                    <button className="delete-btn" onClick={() => handleReject(req._id)}>
                      ✕ Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Requests;
