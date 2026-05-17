const mongoose = require("mongoose")

const EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  time: String,
  venue: String,
  club: String,
  capacity: Number,
  registered: {
    type: Number,
    default: 0
  },
  image: String
})

module.exports = mongoose.model("Event", EventSchema)