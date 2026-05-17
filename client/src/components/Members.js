import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function Members({ club }) {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const clubId = localStorage.getItem("clubId");
  const userRole = localStorage.getItem("userRole");

  const fetchMembers = useCallback(async () => {
    if (!clubId) {
      setError("Club ID not found in session.");
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/clubs/${clubId}/members`, { headers: { Authorization: `Bearer ${token}` } });
      setMembers(res.data);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError(err.response?.data?.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the club?`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/clubs/${clubId}/members/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      
      // Explicitly enforce hard data fetching ensuring parity
      await fetchMembers();
      alert(`${memberName} was successfully removed.`);
    } catch (err) {
      console.error("Error removing member:", err);
      alert(err.response?.data?.message || "Failed to remove member.");
    }
  };

  if (loading) return <div className="loading-state">Loading members...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="section-content">
      <div className="section-header">
        <div>
          <h2>Club Members</h2>
          <p style={{ color: "#94a3b8", margin: 0 }}>Manage the active members of {club.name}</p>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", outline: "none" }}
        />
      </div>

      {members.length === 0 ? (
        <div className="empty-state">No members found in this club yet.</div>
      ) : (
        <div className="requests-list">
          {members.filter(member => {
            const mName = member.userId?.name || "";
            const mEmail = member.userId?.email || "";
            return mName.toLowerCase().includes(search.toLowerCase()) || mEmail.toLowerCase().includes(search.toLowerCase());
          }).map((member) => (
            <div className="request-card" key={member._id}>
              <div className="request-info">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <h3 style={{ margin: 0 }}>{member.userId?.name || "Unknown Member"}</h3>
                  <span style={{ 
                    padding: "3px 8px", 
                    borderRadius: "12px", 
                    fontSize: "0.75rem", 
                    backgroundColor: member.userId?.role === "club_admin" ? "#10b981" : "#3b82f6",
                    color: "white",
                    fontWeight: "bold"
                  }}>
                    {member.userId?.role === "club_admin" ? "Admin" : "Member"}
                  </span>
                </div>
                <p>{member.userId?.email || "No Email"}</p>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "4px 0" }}>
                  Club: {member.clubId?.name || club.name}
                </p>
                <span className="date-badge">Joined: {new Date(member.joinedAt).toLocaleDateString()}</span>
              </div>
              <div className="request-actions">
                {userRole === "club_admin" && (
                  <button 
                    className="reject-btn" 
                    onClick={() => handleRemoveMember(member.userId?._id, member.userId?.name || "Member")}
                  >
                    Remove Member
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Members;
