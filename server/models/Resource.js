const mongoose = require("mongoose")

const ResourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: String,
  quantity: {
    type: Number,
    required: true
  },
  available: {
    type: Number,
    required: true
  },
  club: String
})

module.exports = mongoose.model("Resource", ResourceSchema)
