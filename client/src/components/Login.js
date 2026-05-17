import React, { useState } from "react";
import "./Login.css";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (role === "student" && !email.endsWith("@srmist.edu.in")) {
      setError("Only @srmist.edu.in emails are allowed for students.");
      return;
    }
    
    if (role === "club" && email.endsWith("@srmist.edu.in")) {
      setError("Club portal strictly requires Official Club assigned emails, not your personal campus email!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        role,
        password // Included if you implement password verification later
      });

      const { token, name, email: userEmail, role: userRole, clubName } = res.data;
      if (token) localStorage.setItem("token", token);

      if (userRole === "student" || userRole === "student") {
        // Clear previous club login data to avoid stale roles
        localStorage.removeItem("clubUserName");
        localStorage.removeItem("clubName");
        localStorage.removeItem("clubUserEmail");
        
        localStorage.setItem("userName", name || userEmail.split("@")[0]);
        localStorage.setItem("userEmail", userEmail);
        localStorage.setItem("userRole", "student");
        navigate("/dashboard");
      } else if (userRole === "club_admin" || userRole === "club_member" || userRole === "club") {
        // Clear previous student login data to avoid stale roles
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");

        localStorage.setItem("clubUserName", name || clubName || "Club Member");
        localStorage.setItem("clubName", clubName || "");
        if (res.data.clubId) localStorage.setItem("clubId", res.data.clubId);
        localStorage.setItem("clubUserEmail", userEmail);
        localStorage.setItem("userRole", userRole === "club" ? "club_admin" : userRole); // store specific role
        navigate("/club-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1 className="title">Campus Connect</h1>
        <p className="subtitle">Student Club Resource Management System</p>
      </div>

      <div className="login-wrapper">
        <div className="toggle-container">
          <div className="toggle">
            <button
              className={role === "student" ? "active" : ""}
              onClick={() => setRole("student")}
              type="button"
            >
              Student
            </button>
            <button
              className={role === "club" ? "active" : ""}
              onClick={() => setRole("club")}
              type="button"
            >
              Club Member
            </button>
          </div>
        </div>

        <form className="login-card" onSubmit={handleLogin}>
          <h3>{role === "student" ? "Student Login" : "Club Login"}</h3>

          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder={role === "student" ? "example@srmist.edu.in" : "yourname@clubname.edu.in"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            {role === "student" ? "Login as Student" : "Login as Club"}
          </button>

          {role === "club" && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <Link to="/club-register" style={{ color: "#3498db", textDecoration: "none", fontSize: "0.9rem" }}>
                Don't have a club account? Register Club
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;