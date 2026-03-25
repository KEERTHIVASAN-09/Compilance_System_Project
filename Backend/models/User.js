const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  resolverRole: {
    type: String,
    default: null
  },
  photo: {
    type: String,
    default: null
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedReason: {
    type: String,
    default: ""
  },
  blockedDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
