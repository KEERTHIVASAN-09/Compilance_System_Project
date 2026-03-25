const express = require("express");
const router = express.Router();
const User = require("../models/User");
const BlockRequest = require("../models/BlockRequest");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, resolverRole } = req.body;

    // Trim inputs
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();
    const trimmedRole = role.trim().toLowerCase();
    const trimmedResolverRole = resolverRole ? resolverRole.trim() : "";

    // Validate inputs
    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedRole) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // If registering as resolver, require resolverRole
    if (trimmedRole === 'resolver' && !trimmedResolverRole) {
      return res.status(400).json({ message: "Resolver role/specialty is required for resolvers" });
    }

    // Validate role
    const validRoles = ["user", "resolver", "admin"];
    if (!validRoles.includes(trimmedRole)) {
      return res.status(400).json({ message: "Invalid role. Must be user, resolver, or admin" });
    }

    // Check if user already exists (case-insensitive)
    const userExists = await User.findOne({ email: { $regex: `^${trimmedEmail}$`, $options: 'i' } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      role: trimmedRole,
      resolverRole: trimmedResolverRole || null
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Trim inputs
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedRole = role.trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedRole) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: { $regex: `^${trimmedEmail}$`, $options: 'i' } });
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Validate password (trim and compare)
    if (user.password.trim() !== trimmedPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      // Create unblock request automatically if there is no pending request
      const existingRequest = await BlockRequest.findOne({ userId: user._id, status: "Pending" });
      if (!existingRequest) {
        await new BlockRequest({
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          reason: "Blocked user attempted login and requested unblock"
        }).save();
      }

      return res.status(403).json({ 
        message: "Your account has been blocked. An unblock request has been submitted to admin.",
        isBlocked: true,
        blockedReason: user.blockedReason,
        userId: user._id,
        hasPendingRequest: !!existingRequest
      });
    }

    // Validate role (case-insensitive)
    if (user.role.toLowerCase() !== trimmedRole.toLowerCase()) {
      return res.status(401).json({ message: "Invalid role" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
        isBlocked: user.isBlocked
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).Json({ message: "Server error" });
  }
});

// Update user profile (name)
router.put("/update-profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Change password
router.put("/change-password/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    if (newPassword.trim().length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password (trim and compare)
    if (user.password.trim() !== currentPassword.trim()) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword.trim();
    await user.save();

    res.status(200).json({
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user photo
router.put("/update-photo/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { photo } = req.body;

    if (!photo) {
      return res.status(400).json({ message: "Photo is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { photo: photo },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Photo updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update user role
router.put("/update-role/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({ message: "Role is required" });
    }

    const normalizedRole = role.trim().toLowerCase();
    const validRoles = ["user", "resolver", "admin"];
    if (!validRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role. Must be user, resolver, or admin" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: normalizedRole },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all users (for admin/management)
router.get("/all-users", async (req, res) => {
  try {
    // Include blocking info and resolverRole so admin UI can show correct actions
    const users = await User.find().select("_id name email role resolverRole isBlocked blockedReason blockedDate createdAt");

    res.status(200).json({
      message: "Users retrieved successfully",
      users
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Admin registration (requires admin authentication for additional admins)
router.post("/admin/register", async (req, res) => {
  try {
    const { name, email, password, role, resolverRole } = req.body;
    const adminToken = req.headers.authorization;

    // Check if any admins exist in the system
    const existingAdmins = await User.countDocuments({ role: 'admin' });

    // If no admins exist, allow first admin registration without authentication
    if (existingAdmins === 0) {
      // This is the first admin registration - no authentication required
    } else {
      // Additional admin registrations require existing admin authentication
      if (!adminToken) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      // Verify admin (this is a simple check - in production, use proper JWT)
      const admin = await User.findById(adminToken.replace('Bearer ', ''));
      if (!admin || admin.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
    }

    // Trim inputs
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();
    const trimmedRole = role ? role.trim().toLowerCase() : 'admin';
    const trimmedResolverRole = resolverRole ? resolverRole.trim() : "";

    // Validate inputs
    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // If creating an admin with resolver role (unlikely) or creating resolver admin, enforce resolverRole when role is resolver
    if (trimmedRole === 'resolver' && !trimmedResolverRole) {
      return res.status(400).json({ message: "Resolver role/specialty is required for resolvers" });
    }

    // Validate role
    const validRoles = ["user", "resolver", "admin"];
    if (!validRoles.includes(trimmedRole)) {
      return res.status(400).json({ message: "Invalid role. Must be user, resolver, or admin" });
    }

    // Check if user already exists (case-insensitive)
    const userExists = await User.findOne({ email: { $regex: `^${trimmedEmail}$`, $options: 'i' } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      role: trimmedRole,
      resolverRole: trimmedResolverRole || null
    });

    await user.save();

    res.status(201).json({
      message: existingAdmins === 0 ? "First user registered successfully!" : "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Block user by admin with comments
router.put("/user/:userId/block", async (req, res) => {
  try {
    const { userId } = req.params;
    const { blockedReason } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Block the user
    user.isBlocked = true;
    user.blockedReason = blockedReason || "Account blocked by administrator";
    user.blockedDate = new Date();
    await user.save();

    // Log the blocking action
    console.log(`User blocked: ${user.name} (${user.email}) - Reason: ${blockedReason}`);

    res.status(200).json({
      message: "User blocked successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
        blockedReason: user.blockedReason
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Unblock user by admin
router.put("/user/:userId/unblock", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Unblock the user
    user.isBlocked = false;
    user.blockedReason = "";
    user.blockedDate = null;
    await user.save();

    console.log(`User unblocked: ${user.name} (${user.email})`);

    res.status(200).json({
      message: "User unblocked successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
