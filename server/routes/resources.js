const express = require("express");
const router = express.Router();
const Resource = require("../models/Resource");

// GET all resources (or filter by club)
router.get("/", async (req, res) => {
  try {
    const { club } = req.query;
    const filter = club ? { club } : {};
    const resources = await Resource.find(filter);
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE resource
router.post("/", async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE resource
router.delete("/:id", async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: "Resource deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
