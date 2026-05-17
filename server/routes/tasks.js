const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

const authMiddleware = require("../middleware/authMiddleware");

// GET all tasks (or filter by club)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { club } = req.query;
    let filter = club ? { club } : {};
    
    // Aggressive member isolation filtering
    if (req.user.role === "club_member") {
      filter.assignedToEmail = req.user.email;
    }
    
    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE task
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "club_admin") return res.status(403).json({ message: "Only admins can assign tasks" });
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE task
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "club_admin") return res.status(403).json({ message: "Only admins can delete tasks" });
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE task
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const taskData = await Task.findById(req.params.id);
    if (!taskData) return res.status(404).json({ message: "Task missing" });

    // Enforce isolated status edits
    if (req.user.role === "club_member" && taskData.assignedToEmail !== req.user.email) {
      return res.status(403).json({ message: "You can only edit tasks specifically assigned to your email" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
