const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  members: [String],
  image: String,
  adminId: String
});

module.exports = mongoose.model("Club", clubSchema);