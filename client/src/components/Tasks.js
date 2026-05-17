import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Modal from "./Modal";
import "./Dashboard.css";

function Tasks({ club }) {
  const [tasks, setTasks] = useState([]);
  const [clubMembers, setClubMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    assignedToEmail: "",
    status: "Pending",
    deadline: ""
  });
  
  const userRole = localStorage.getItem("userRole");
  const clubName = club?.clubName || "Club";

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/tasks?club=${clubName}`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [clubName]);

  const fetchClubMembers = useCallback(async () => {
    if (userRole !== "club_admin") return;
    try {
      const clubId = localStorage.getItem("clubId");
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/clubs/${clubId}/members`, { headers: { Authorization: `Bearer ${token}` } });
      setClubMembers(res.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  }, [userRole]);

  useEffect(() => {
    fetchTasks();
    fetchClubMembers();
  }, [fetchTasks, fetchClubMembers]);

  const handleInputChange = (e) => {
    if (e.target.name === "assignedToEmail") {
      const selectedMember = clubMembers.find(m => m.userId?.email === e.target.value);
      setFormData({ 
        ...formData, 
        assignedToEmail: e.target.value, 
        assignedTo: selectedMember ? selectedMember.userId.name : "" 
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/tasks", { ...formData, club: clubName }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Task assigned successfully!");
      setIsModalOpen(false);
      setFormData({ title: "", description: "", assignedTo: "", assignedToEmail: "", status: "Pending", deadline: "" });
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const updateStatus = async (id, newStatus, currentTask) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/tasks/${id}`, { ...currentTask, status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      fetchTasks();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Completed": return "#10b981";
      case "In Progress": return "#3b82f6";
      default: return "#f59e0b";
    }
  };

  return (
    <div className="section-content">
      <div className="section-header">
        <div>
          <h2>Task Management</h2>
          <p style={{ color: '#94a3b8', margin: 0 }}>Assign and track club tasks</p>
        </div>
        {userRole === "club_admin" && (
          <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
            + Add New Task
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">No tasks available. Create one to get started.</div>
      ) : (
        <div className="list-container">
          {tasks.map((task) => (
            <div className="list-item" key={task._id}>
              <div className="item-info">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                {task.submission && (
                  <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', margin: '10px 0', borderRadius: '4px' }}>
                    <strong style={{ color: '#10b981' }}>Submission: </strong> 
                    <span style={{ color: '#cbd5e1' }}>{task.submission}</span>
                  </div>
                )}
                <div className="item-meta">
                  <span>👤 Assigned to: {task.assignedTo || "Unassigned"}</span>
                  <span>📅 Deadline: {task.deadline || "None"}</span>
                </div>
              </div>
              <div className="item-actions" style={{ flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select 
                    value={task.status} 
                    onChange={(e) => updateStatus(task._id, e.target.value, task)}
                    style={{ 
                      padding: '8px', 
                      borderRadius: '8px', 
                      background: 'rgba(15, 23, 42, 0.6)', 
                      color: getStatusColor(task.status),
                      border: `1px solid ${getStatusColor(task.status)}`,
                      outline: 'none'
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {userRole === "club_admin" && (
                    <button className="delete-btn" onClick={() => handleDelete(task._id)}>
                      🗑️ Delete
                    </button>
                  )}
                </div>
                {userRole === "club_member" && task.status !== "Completed" && (
                  <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '5px' }}>
                    <input 
                      type="text" 
                      placeholder="Paste work link or notes..."
                      id={`submission-${task._id}`}
                      style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#1e293b', color: 'white', fontSize: '0.85rem' }}
                    />
                    <button 
                      className="primary-btn" 
                      style={{ padding: '8px 15px', background: '#3b82f6', fontSize: '0.85rem' }}
                      onClick={() => {
                        const val = document.getElementById(`submission-${task._id}`).value;
                        if (!val.trim()) return alert("Please enter your submission link/notes.");
                        updateStatus(task._id, "Completed", { ...task, submission: val });
                      }}
                    >
                      Submit Work
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Task">
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Assign Member</label>
            <select name="assignedToEmail" value={formData.assignedToEmail} onChange={handleInputChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white' }}>
              <option value="">-- Select Member --</option>
              {clubMembers.map(member => (
                <option key={member._id} value={member.userId?.email}>
                  {member.userId?.name} ({member.userId?.email})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Deadline</label>
            <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} />
          </div>
          <button type="submit" className="submit-btn">Create Task</button>
        </form>
      </Modal>
    </div>
  );
}

export default Tasks;
