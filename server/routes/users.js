const express = require("express");
const router = express.Router();
const User = require("../models/User");

// LOGIN User
router.post("/login", async (req, res) => {
  try {
    const { email, role, name } = req.body;
    
    // basic validation
    if (role === 'student' && !email.endsWith("@srmist.edu.in")) {
      return res.status(403).json({ message: "Only @srmist.edu.in emails allowed for students" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, role, name });
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
