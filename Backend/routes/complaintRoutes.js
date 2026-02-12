const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");

// ✅ Get all complaints for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const complaints = await Complaint.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Complaints retrieved successfully",
      complaints
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get dashboard stats for a user
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const total = await Complaint.countDocuments({ userId });
    const inProgress = await Complaint.countDocuments({ userId, status: "In Progress" });
    const resolved = await Complaint.countDocuments({ userId, status: "Resolved" });
    const pending = await Complaint.countDocuments({ userId, status: "Pending" });

    res.status(200).json({
      message: "Stats retrieved successfully",
      stats: {
        total,
        inProgress,
        resolved,
        pending
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create a new complaint
router.post("/create", async (req, res) => {
  try {
    const { userId, title, description, category, priority } = req.body;

    if (!userId || !title || !description || !category) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const complaint = new Complaint({
      userId,
      title,
      description,
      category,
      priority: priority || "Medium",
      status: "Pending"
    });

    await complaint.save();

    res.status(201).json({
      message: "Complaint created successfully",
      complaint
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update complaint status
router.put("/update/:complaintId", async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, resolverComments, resolverId, resolverName } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        status,
        resolverComments,
        resolverId: resolverId || complaint?.resolverId,
        resolverName: resolverName || complaint?.resolverName,
        updatedAt: Date.now(),
        resolvedAt: status === "Resolved" ? Date.now() : complaint?.resolvedAt
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Create notification if complaint is resolved
    if (status === "Resolved") {
      const notification = new Notification({
        userId: complaint.userId,
        complaintId: complaint._id,
        complaintTitle: complaint.title,
        type: "RESOLVED",
        resolverName: resolverName || "Support Team",
        resolutionMessage: `Your complaint has been resolved`,
        resolverComments: resolverComments,
        resolvedAt: Date.now()
      });

      await notification.save();
    }
    // Create notification if complaint moves to In Progress
    else if (status === "In Progress") {
      const notification = new Notification({
        userId: complaint.userId,
        complaintId: complaint._id,
        complaintTitle: complaint.title,
        type: "IN_PROGRESS",
        resolverName: resolverName || "Support Team",
        resolutionMessage: `Your complaint is now being worked on`,
        resolverComments: resolverComments,
        resolvedAt: Date.now()
      });

      await notification.save();
    }

    res.status(200).json({
      message: "Complaint updated successfully",
      complaint
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get single complaint by ID
router.get("/:complaintId", async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({
      message: "Complaint retrieved successfully",
      complaint
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete complaint
router.delete("/delete/:complaintId", async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findByIdAndDelete(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({
      message: "Complaint deleted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
