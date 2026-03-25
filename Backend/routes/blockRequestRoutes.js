const express = require("express");
const router = express.Router();
const BlockRequest = require("../models/BlockRequest");
const User = require("../models/User");

// ✅ Create unblock request by user
router.post("/create", async (req, res) => {
  try {
    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isBlocked) {
      return res.status(400).json({ message: "User is not blocked" });
    }

    // Check if there's already a pending request
    const existingRequest = await BlockRequest.findOne({
      userId,
      status: "Pending"
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending unblock request. Please wait for admin response."
      });
    }

    const blockRequest = new BlockRequest({
      userId,
      userName: user.name,
      userEmail: user.email,
      reason: reason || "I would like to request to be unblocked"
    });

    await blockRequest.save();

    res.status(201).json({
      message: "Unblock request submitted successfully",
      request: blockRequest
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all block requests for admin
router.get("/all", async (req, res) => {
  try {
    const blockRequests = await BlockRequest.find()
      .populate("userId", "name email")
      .sort({ requestedAt: -1 });

    res.status(200).json({
      message: "Block requests retrieved successfully",
      requests: blockRequests,
      count: blockRequests.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get pending block requests for admin
router.get("/pending", async (req, res) => {
  try {
    const blockRequests = await BlockRequest.find({ status: "Pending" })
      .populate("userId", "name email")
      .sort({ requestedAt: -1 });

    res.status(200).json({
      message: "Pending block requests retrieved successfully",
      requests: blockRequests,
      count: blockRequests.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get unblock requests for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const blockRequests = await BlockRequest.find({ userId })
      .sort({ requestedAt: -1 });

    res.status(200).json({
      message: "Block requests retrieved successfully",
      requests: blockRequests
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Approve unblock request by admin
router.put("/:requestId/approve", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminResponse } = req.body;

    const blockRequest = await BlockRequest.findById(requestId);
    if (!blockRequest) {
      return res.status(404).json({ message: "Block request not found" });
    }

    // Update block request status
    blockRequest.status = "Approved";
    blockRequest.adminResponse = adminResponse || "Your request has been approved";
    blockRequest.respondedAt = new Date();
    await blockRequest.save();

    // Unblock the user
    const user = await User.findById(blockRequest.userId);
    if (user) {
      user.isBlocked = false;
      user.blockedReason = "";
      user.blockedDate = null;
      await user.save();
    }

    console.log(`Unblock request approved for: ${blockRequest.userName}`);

    res.status(200).json({
      message: "Unblock request approved successfully",
      request: blockRequest
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Reject unblock request by admin (delete the request)
router.put("/:requestId/reject", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminResponse } = req.body;

    const blockRequest = await BlockRequest.findById(requestId);
    if (!blockRequest) {
      return res.status(404).json({ message: "Block request not found" });
    }

    // Delete the block request instead of just rejecting it
    await BlockRequest.findByIdAndDelete(requestId);

    console.log(`Unblock request rejected and deleted for: ${blockRequest.userName}`);

    res.status(200).json({
      message: "Unblock request rejected and deleted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
