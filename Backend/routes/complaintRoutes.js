const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ✅ Get all resolvers
router.get("/resolvers/all", async (req, res) => {
  try {
    const resolvers = await User.find({ 
      role: { $in: ["Resolver", "resolver"] } 
    }).select("_id name email role");
    
    console.log("Fetched resolvers:", resolvers);
    console.log("Total resolvers found:", resolvers.length);

    res.status(200).json({
      message: "Resolvers retrieved successfully",
      resolvers: resolvers,
      count: resolvers.length
    });

  } catch (error) {
    console.error("Error fetching resolvers:", error);
    res.status(500).json({ message: "Server error fetching resolvers", error: error.message });
  }
});

// ✅ Get resolvers by specialty (resolverRole)
router.get("/resolvers/by-specialty/:specialty", async (req, res) => {
  try {
    const { specialty } = req.params;
    const specialtyRegex = new RegExp(`^${specialty}$`, 'i');

    const resolvers = await User.find({ 
      role: { $in: ["Resolver", "resolver"] },
      resolverRole: { $regex: specialtyRegex }
    }).select("_id name email role resolverRole");

    res.status(200).json({
      message: "Resolvers retrieved successfully",
      resolvers,
      count: resolvers.length
    });
  } catch (error) {
    console.error("Error fetching resolvers by specialty:", error);
    res.status(500).json({ message: "Server error fetching resolvers", error: error.message });
  }
});

// ✅ Get all complaints with complainer information
router.get("/all/with-users", async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All complaints retrieved successfully",
      complaints
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// ✅ Get complaints assigned to a specific resolver
router.get("/resolver/:resolverId/assigned", async (req, res) => {
  try {
    const { resolverId } = req.params;
    
    const complaints = await Complaint.find({ 
      resolverId: resolverId 
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Resolver complaints retrieved successfully",
      complaints,
      count: complaints.length
    });

  } catch (error) {
    console.error("Error fetching resolver complaints:", error);
    res.status(500).json({ message: "Server error fetching resolver complaints" });
  }
});
// ✅ Get all unassigned complaints (not assigned to any resolver)
router.get("/unassigned/list", async (req, res) => {
  try {
    const complaints = await Complaint.find({ resolverId: null })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Unassigned complaints retrieved successfully",
      complaints
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Assign complaint to resolver
router.put("/assign/:complaintId", async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { resolverId } = req.body;

    if (!resolverId) {
      return res.status(400).json({ message: "Resolver ID is required" });
    }

    // Get resolver information
    const resolver = await User.findById(resolverId);
    if (!resolver) {
      return res.status(404).json({ message: "Resolver not found" });
    }

    // Update complaint with resolver
    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        resolverId: resolverId,
        resolverName: resolver.name,
        status: "Pending"
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({
      message: "Complaint assigned successfully",
      complaint
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

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

// ✅ Get all complaints assigned to a resolver
router.get("/resolver/:resolverId/complaints", async (req, res) => {
  try {
    const { resolverId } = req.params;
    const complaints = await Complaint.find({ resolverId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    if (!complaints || complaints.length === 0) {
      return res.status(200).json({ 
        message: "No complaints found",
        complaints: []
      });
    }

    res.status(200).json({
      message: "Resolver complaints retrieved successfully",
      complaints
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get resolver dashboard stats
router.get("/resolver/:resolverId/stats", async (req, res) => {
  try {
    const { resolverId } = req.params;

    const assigned = await Complaint.countDocuments({ resolverId });
    const pending = await Complaint.countDocuments({ resolverId, status: "Pending" });
    const inProgress = await Complaint.countDocuments({ resolverId, status: "In Progress" });
    const resolved = await Complaint.countDocuments({ resolverId, status: "Resolved" });

    res.status(200).json({
      message: "Resolver stats retrieved successfully",
      stats: {
        assigned,
        pending,
        inProgress,
        resolved
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get admin dashboard stats (all complaints)
router.get("/admin/system-stats", async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: "Pending" });
    const inProgressComplaints = await Complaint.countDocuments({ status: "In Progress" });
    const resolvedComplaints = await Complaint.countDocuments({ status: "Resolved" });

    res.status(200).json({
      message: "System stats retrieved successfully",
      stats: {
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints
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
    const { userId, title, description, category, priority, resolverId } = req.body;

    if (!userId || !title || !description || !category) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    let resolverName = "";
    if (resolverId) {
      const resolver = await User.findById(resolverId);
      if (resolver) {
        resolverName = resolver.name;
      }
    }

    const complaint = new Complaint({
      userId,
      title,
      description,
      category,
      priority: priority || "Medium",
      status: "Pending",
      resolverId: resolverId || null,
      resolverName: resolverName || ""
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

// ✅ Resolver updates complaint status
router.put("/resolver/:complaintId/resolve", async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, resolverComments, resolverId } = req.body;

    // Validate status
    const validStatuses = ["Pending", "In Progress", "Resolved", "Declined", "Dismissed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Get resolver name
    const resolver = await User.findById(resolverId);
    const resolverName = resolver ? resolver.name : "Support Team";

    const updateData = {
      status,
      resolverComments: resolverComments || complaint?.resolverComments,
      updatedAt: Date.now(),
      resolvedAt: status === "Resolved" ? Date.now() : complaint?.resolvedAt
    };

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      updateData,
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
        resolverName: resolverName,
        resolutionMessage: `Your complaint has been resolved`,
        resolverComments: resolverComments,
        resolvedAt: Date.now()
      });

      await notification.save();
    }
    // Create notification if complaint is declined
    else if (status === "Declined") {
      const notification = new Notification({
        userId: complaint.userId,
        complaintId: complaint._id,
        complaintTitle: complaint.title,
        type: "DECLINED",
        resolverName: resolverName,
        resolutionMessage: `Your complaint has been declined`,
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
        resolverName: resolverName,
        resolutionMessage: `Your complaint is now being worked on`,
        resolverComments: resolverComments,
        resolvedAt: Date.now()
      });

      await notification.save();
    }
    // Create notification if complaint is dismissed
    else if (status === "Dismissed") {
      const notification = new Notification({
        userId: complaint.userId,
        complaintId: complaint._id,
        complaintTitle: complaint.title,
        type: "DISMISSED",
        resolverName: resolverName,
        resolutionMessage: `Your complaint has been dismissed`,
        resolverComments: resolverComments,
        resolvedAt: Date.now()
      });

      await notification.save();
    }

    res.status(200).json({
      message: "Complaint resolved successfully",
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

// ✅ Debug endpoint - Get all users by role
router.get("/debug/users-by-role", async (req, res) => {
  try {
    const allUsers = await User.find({}).select("_id name email role");
    const usersByRole = {
      User: allUsers.filter(u => u.role?.toLowerCase() === "user").length,
      Resolver: allUsers.filter(u => u.role?.toLowerCase() === "resolver").length,
      Admin: allUsers.filter(u => u.role?.toLowerCase() === "admin").length,
      total: allUsers.length
    };
    
    console.log("Users by Role:", usersByRole);
    console.log("All Users:", allUsers);
    
    res.status(200).json({
      message: "User statistics",
      usersByRole,
      users: allUsers
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Debug endpoint - Add test resolver (for testing only)
router.post("/debug/add-test-resolver", async (req, res) => {
  try {
    // Check if test resolver already exists
    const existingResolver = await User.findOne({ email: "resolver@test.com" });
    
    if (existingResolver) {
      return res.status(200).json({
        message: "Test resolver already exists",
        resolver: {
          id: existingResolver._id,
          name: existingResolver.name,
          email: existingResolver.email,
          role: existingResolver.role
        }
      });
    }
    
    // Create test resolver
    const testResolver = new User({
      name: "Test Resolver",
      email: "resolver@test.com",
      password: "test123",
      role: "resolver"
    });
    
    await testResolver.save();
    
    console.log("Test resolver created:", testResolver);
    
    res.status(201).json({
      message: "✅ Test resolver created successfully",
      resolver: {
        id: testResolver._id,
        name: testResolver.name,
        email: testResolver.email,
        role: testResolver.role
      }
    });
  } catch (error) {
    console.error("Error creating test resolver:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Delete complaint by admin with comments
router.delete("/delete/:complaintId", async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { comments } = req.body;

    if (!complaintId) {
      return res.status(400).json({ message: "Complaint ID is required" });
    }

    const complaint = await Complaint.findById(complaintId).populate('userId', 'name email');
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Store deletion log before deleting
    console.log(`Complaint deleted: "${complaint.title}" (ID: ${complaint._id}) - Comments: ${comments || "None"}`);

    await Complaint.findByIdAndDelete(complaintId);

    res.status(200).json({
      message: "Complaint deleted successfully",
      deletedComplaint: {
        id: complaint._id,
        title: complaint.title,
        userId: complaint.userId,
        category: complaint.category,
        comments: comments || "No comments provided"
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
