const express = require("express");
const router = express.Router();

const ClubMember = require("../models/ClubMember");


// CLUB LOGIN

router.post("/login", async (req, res) => {

  const { email, password } = req.body;

  try {

    const user = await ClubMember.findOne({
      email: email.toLowerCase(),
      password: password,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid club login",
      });
    }

    res.json({
      name: user.name,
      email: user.email,
      clubName: user.clubName,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

module.exports = router;