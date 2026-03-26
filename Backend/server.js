require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const blockRequestRoutes = require("./routes/blockRequestRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/block-requests", blockRequestRoutes);

// ✅ Direct MongoDB connection (NO .env)
mongoose.connect("mongodb+srv://vasan:anitha07@cluster0.7nglaqy.mongodb.net/Compilance_system")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

// Test route (optional)
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});