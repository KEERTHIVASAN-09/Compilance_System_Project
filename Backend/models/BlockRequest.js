const mongoose = require("mongoose");

const blockRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true,
    default: "I would like to request to be unblocked"
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  adminResponse: {
    type: String,
    default: ""
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("BlockRequest", blockRequestSchema);
