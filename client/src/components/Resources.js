import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Modal from "./Modal";
import "./Dashboard.css";

function Resources({ club }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    quantity: "",
    available: ""
  });
  
  const userRole = localStorage.getItem("userRole");
  const clubName = club?.clubName || "Club";

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/resources?club=${clubName}`);
      setResources(res.data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  }, [clubName]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/resources", { 
        ...formData, 
        quantity: Number(formData.quantity),
        available: Number(formData.available) || Number(formData.quantity),
        club: clubName 
      });
      alert("Resource added successfully!");
      setIsModalOpen(false);
      setFormData({ name: "", type: "", quantity: "", available: "" });
      fetchResources();
    } catch (error) {
      console.error("Error adding resource:", error);
      alert("Failed to add resource");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/resources/${id}`);
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  return (
    <div className="section-content">
      <div className="section-header">
        <div>
          <h2>Resource Management</h2>
          <p style={{ color: '#94a3b8', margin: 0 }}>Track club equipment and materials</p>
        </div>
        {userRole === "club_admin" && (
          <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
            + Add Resource
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="empty-state">No resources available. Add some inventory to get started.</div>
      ) : (
        <div className="list-container">
          {resources.map((resource) => (
            <div className="list-item" key={resource._id}>
              <div className="item-info">
                <h3>{resource.name}</h3>
                <p>Type: {resource.type || "General"}</p>
                <div className="resource-stats">
                  <div className="stat-badge">
                    <span>Total</span>
                    <strong>{resource.quantity}</strong>
                  </div>
                  <div className="stat-badge available">
                    <span>Available</span>
                    <strong>{resource.available}</strong>
                  </div>
                </div>
              </div>
              <div className="item-actions">
                {userRole === "club_admin" && (
                  <button className="delete-btn" onClick={() => handleDelete(resource._id)}>
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Resource">
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Resource Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Category/Type</label>
            <input type="text" name="type" placeholder="e.g. Electronics, Marketing" value={formData.type} onChange={handleInputChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Total Quantity</label>
              <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Currently Available</label>
              <input type="number" min="0" name="available" value={formData.available} onChange={handleInputChange} />
            </div>
          </div>
          <button type="submit" className="submit-btn">Add Resource</button>
        </form>
      </Modal>
    </div>
  );
}

export default Resources;
