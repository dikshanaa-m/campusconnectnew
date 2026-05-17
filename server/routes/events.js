const express = require("express")
const router = express.Router()
const Event = require("../models/Event")
const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

// GET all events
router.get("/", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET club events
router.get("/club/:club", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({
      club: req.params.club,
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE event
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const event = new Event(req.body)
    await event.save()
    res.json(event)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

// DELETE event
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE event
router.put("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router