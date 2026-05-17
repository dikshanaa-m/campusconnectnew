const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  role: {
    type: String,
    enum: ['student', 'admin', 'club_admin', 'club_member', 'club'],
    default: 'student'
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  },
  clubName: String,
  password: {
    type: String,
    required: false // Optional for backward compatibility but available for use
  }
})

module.exports = mongoose.model("User", UserSchema)
