const express = require("express");
const router = express.Router();

const JoinRequest = require("../models/JoinRequest");
const Club = require("../models/Club");


// send request

router.post("/", async (req, res) => {

  try {

    const { clubId, studentEmail } = req.body;

    const request = new JoinRequest({
      clubId,
      studentEmail
    });

    await request.save();

    res.json({ message: "Request sent" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

});


// get all requests (for club head)

router.get("/", async (req, res) => {

  const requests = await JoinRequest.find().populate("clubId");

  res.json(requests);

});


// accept request

router.post("/accept/:id", async (req, res) => {

  try {

    const request = await JoinRequest.findById(req.params.id);

    request.status = "accepted";

    await request.save();

    const club = await Club.findById(request.clubId);

    club.members.push(request.studentEmail);

    await club.save();

    res.json({ message: "Accepted" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

});


// reject request

router.post("/reject/:id", async (req, res) => {

  const request = await JoinRequest.findById(req.params.id);

  request.status = "rejected";

  await request.save();

  res.json({ message: "Rejected" });

});


module.exports = router;