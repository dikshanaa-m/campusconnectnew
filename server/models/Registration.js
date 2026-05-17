const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({

  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event"
  },

  studentEmail: String,

  date: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Registration", registrationSchema);