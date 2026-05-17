const express = require("express")
const router = express.Router()

const Registration = require("../models/Registration")
const Event = require("../models/Event")

// GET registrations by email
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    // We need to fetch the event details too. Since Event is just an ID in standard mongoose ref, 
    // and looking at the models earlier Registration doesn't have a strict ref. 
    // We will find all registrations, then manually fetch events or use populate if ref exists.
    // Let's do it manually just in case refs aren't set up perfectly.
    const registrations = await Registration.find({ studentEmail: email });
    
    const populatedRegistrations = await Promise.all(registrations.map(async (reg) => {
      const event = await Event.findById(reg.eventId);
      return {
        _id: reg._id,
        eventId: event || { _id: reg.eventId, title: "Unknown Event" }, // fallback
        studentEmail: reg.studentEmail,
        createdAt: reg.createdAt
      };
    }));
    
    res.json(populatedRegistrations.filter(r => r.eventId._id)); // filter out orphaned registrations
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register for event
router.post("/", async (req, res) => {
  try {
    const { eventId, studentEmail } = req.body

    const registration = new Registration({
      eventId,
      studentEmail
    })

    await registration.save()

    // update event seats
    await Event.findByIdAndUpdate(eventId, {
      $inc: { registered: 1 }
    })

    res.json({ message: "Registered successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

// Cancel registration
router.delete("/:id", async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: "Registration not found" });

    // Decrease event registered count
    await Event.findByIdAndUpdate(reg.eventId, {
      $inc: { registered: -1 }
    });

    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: "Registration cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel registration by event and user email
router.delete("/", async (req, res) => {
  try {
    const { eventId, studentEmail } = req.query;
    if (!eventId || !studentEmail) return res.status(400).json({ message: "eventId and studentEmail required" });

    const reg = await Registration.findOne({ eventId, studentEmail });
    if (!reg) return res.status(404).json({ message: "Registration not found" });

    // Decrease event registered count
    await Event.findByIdAndUpdate(reg.eventId, {
      $inc: { registered: -1 }
    });

    await Registration.findByIdAndDelete(reg._id);
    res.json({ message: "Registration cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router