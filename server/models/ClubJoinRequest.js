const mongoose = require("mongoose");

const clubJoinRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
  clubName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentName: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ClubJoinRequest", clubJoinRequestSchema);
