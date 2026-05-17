import React, { useState } from "react";
import "./Login.css"; // Reuse login styles for a consistent aesthetic
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function ClubRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    description: "",
    category: "",
    contactNumber: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const expectedDomain = `@${formData.name.toLowerCase().replace(/\s+/g, '')}.edu.in`;
    if (!formData.email.endsWith(expectedDomain)) {
      setError(`Club Email must end with ${expectedDomain}`);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/clubs/register", formData);
      setSuccess("Club registered successfully! Redirecting to login...");
      
      // Redirect after brief delay
      setTimeout(() => {
        navigate("/login", { state: { role: "club" } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1 className="title">Campus Connect</h1>
        <p className="subtitle">Student Club Resource Management System</p>
      </div>

      <div className="login-wrapper">
        <form className="login-card" onSubmit={handleRegister}>
          <h3>Register New Club</h3>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message" style={{ color: "green", marginBottom: "1rem", textAlign: "center" }}>{success}</div>}

          <div className="input-group">
            <label>Club Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter Club Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Club Email *</label>
            <input
              type="email"
              name="email"
              placeholder={formData.name ? `name@${formData.name.toLowerCase().replace(/\\s+/g, '')}.edu.in` : "name@clubname.edu.in"}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Description *</label>
            <textarea
              name="description"
              placeholder="Briefly describe your club..."
              value={formData.description}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                minHeight: "60px",
                fontFamily: "inherit"
              }}
            />
          </div>

          <div className="input-group">
            <label>Category (Optional)</label>
            <input
              type="text"
              name="category"
              placeholder="e.g. Technical, Cultural"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Contact Number (Optional)</label>
            <input
              type="tel"
              name="contactNumber"
              placeholder="Enter contact number"
              value={formData.contactNumber}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Registering..." : "Register Club"}
          </button>
          
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <Link to="/login" style={{ color: "#3498db", textDecoration: "none", fontSize: "0.9rem" }}>
              Already registered? Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClubRegister;
