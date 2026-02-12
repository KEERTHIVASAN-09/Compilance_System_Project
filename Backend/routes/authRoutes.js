const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Trim inputs
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();
    const trimmedRole = role.trim();

    // Validate inputs
    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedRole) {
      return res.status(400).json({ message: "All fields are required" });
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
      role: trimmedRole
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
        photo: user.photo
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

module.exports = router;
