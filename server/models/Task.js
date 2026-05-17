const mongoose = require("mongoose")

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending"
  },
  assignedTo: String,
  assignedToEmail: String,
  submission: String,
  deadline: String,
  club: String
})

module.exports = mongoose.model("Task", TaskSchema)
