const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// ✅ Get all notifications for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate("complaintId", "title status category");

    res.status(200).json({
      message: "Notifications retrieved successfully",
      notifications
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get unread notifications count
router.get("/unread/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });

    res.status(200).json({
      message: "Unread count retrieved successfully",
      unreadCount
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Mark notification as read
router.put("/mark-read/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Mark all notifications as read
router.put("/mark-all-read/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      message: "All notifications marked as read"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete a notification
router.delete("/delete/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification deleted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
