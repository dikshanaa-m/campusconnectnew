const mongoose = require("mongoose");

const clubMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
    required: true
  },
  role: {
    type: String,
    default: "club_member"
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ClubMember", clubMemberSchema);