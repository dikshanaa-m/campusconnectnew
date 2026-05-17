const mongoose = require("mongoose");

const joinRequestSchema = new mongoose.Schema({

  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club"
  },

  studentEmail: String,

  status: {
    type: String,
    default: "pending"
  }

});

module.exports = mongoose.model("JoinRequest", joinRequestSchema);