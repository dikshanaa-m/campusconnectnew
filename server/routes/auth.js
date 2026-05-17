const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, role } = req.body;

    // Validate email domain for students
    if (role === "student" && !email.endsWith("@srmist.edu.in")) {
      return res.status(403).json({ message: "Only @srmist.edu.in emails are allowed for students." });
    }
    if (role === "club" && email.endsWith("@srmist.edu.in")) {
      return res.status(403).json({ message: "Club members must strictly use generated official emails!" });
    }

    // Find user in database
    const user = await User.findOne({ email });

    // If not found
    if (!user) {
      return res.status(404).json({ message: "User not registered" });
    }

    // Validate login access matrix
    let roleIsValid = false;

    if (role === "student") {
      // Students who joined a club (club_member) are statically still students and can access the student dashboard
      if (user.role === "student" || user.role === "club_member") {
        roleIsValid = true;
      }
    } else if (role === "club") {
      // Club login portal
      if (user.role === "club_admin" || user.role === "club_member" || user.role === "club") {
        roleIsValid = true;
      }
    } else {
      // Fallback for native admins or raw role injections
      if (user.role === role) roleIsValid = true;
    }

    // If found but role doesn't match the login portal tab
    if (!roleIsValid) {
      return res.status(403).json({ message: "Invalid role for this email" });
    }

    // Check if club user has a clubName registered
    if ((user.role === "club_admin" || user.role === "club_member") && role === "club" && !user.clubName) {
      return res.status(403).json({ message: "Database Error: User does not have an assigned clubName" });
    }

    let clubId = user.clubId || null;
    const Club = require("../models/Club");

    if (clubId) {
      const clubExists = await Club.findById(clubId);
      if (!clubExists) {
        return res.status(400).json({ message: "Invalid club assignment. Contact admin." });
      }
    } else if ((user.role === "club_admin" || user.role === "club_member") && user.clubName) {
      const club = await Club.findOne({ name: user.clubName });
      if (club) clubId = club._id;
    }

    if (user.role === "club_admin" || user.role === "club_member") {
      if (!clubId) {
        return res.status(400).json({ message: "User role requires valid club assignment" });
      }
    } else if (user.role === "student" || user.role === "admin") {
      clubId = null;
    }

    const jwtPayload = {
      id: user._id,
      email: user.email,
      role: role === "student" ? "student" : user.role,
      clubId
    };

    const token = jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "1d" }
    );

    // Return user data for client storage, actively masking the elevated role if they explicitly chose 'Student Login'
    res.json({
      token,
      name: user.name,
      email: user.email,
      role: jwtPayload.role,
      clubName: user.clubName,
      clubId
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
