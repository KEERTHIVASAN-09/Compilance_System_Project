const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["Internet", "Water", "Power", "Gas", "Maintenance", "Other"],
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved", "Declined", "Dismissed"],
    default: "Pending"
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolverComments: {
    type: String,
    default: ""
  },
  resolverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  resolverName: {
    type: String,
    default: ""
  },
  resolvedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("Complaint", complaintSchema);
