const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint",
    required: true
  },
  complaintTitle: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["RESOLVED", "IN_PROGRESS", "UNDER_REVIEW"],
    required: true
  },
  resolverName: {
    type: String,
    required: true
  },
  resolutionMessage: {
    type: String,
    default: ""
  },
  resolverComments: {
    type: String,
    default: ""
  },
  resolvedAt: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Notification", notificationSchema);
