// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const AuthUser = require("../models/AuthUser");   // 🔹 Participants login/register
const User = require("../models/User");           // 🔹 Profile data
const AdminUser = require("../models/AdminUser"); // 🔹 Admins login

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// ============================
// REGISTER (Participants Only)
// ============================

router.post("/register", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password)
      return res.status(400).json({ error: "Phone and password are required" });

    // Check if phone already registered
    const existing = await AuthUser.findOne({ phone });
    if (existing) return res.status(400).json({ error: "Phone already registered" });

    const authUser = new AuthUser({
      phone,
      password, // bcrypt handled in schema
      role: "participant",
    });

    await authUser.save();

    // ✅ DO NOT generate JWT here
    res.json({
      message: "Registration successful! Please login to continue."
    });

  } catch (err) {
    console.error("🔥 Register error:", err);
    res.status(500).json({ error: err.message });
  }
});

// LOGIN (Admin + Participants)
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ error: "Phone and password are required" });

    // --- Check admin first
    let userDoc = await AdminUser.findOne({ phone }).select("+password");
    if (userDoc) {
      const isMatch = await userDoc.comparePassword(password);
      if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: userDoc._id, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
      const user = { id: userDoc._id, name: userDoc.name || "Admin", phone: userDoc.phone, role: "admin" };
      return res.json({ user, token });
    }

    // --- Check participant
    userDoc = await AuthUser.findOne({ phone }).select("+password");
    if (!userDoc) return res.status(400).json({ error: "User not found" });

    const isMatch = await userDoc.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // --- Fetch profile from User collection
    const userProfile = await User.findOne({ phone });
    if (!userProfile) {
      return res.status(403).json({
        error: "Your account exists but has not been activated by admin. Contact admin.",
      });
    }

    const token = jwt.sign({ id: userDoc._id, role: "participant" }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ user: userProfile, token });
  } catch (err) {
    console.error("🔥 Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================
// FORGOT PASSWORD (Participants Only)
// ============================
router.post("/forgot-password", async (req, res) => {
  try {
    const { phone } = req.body;
    const authUser = await AuthUser.findOne({ phone });
    if (!authUser) return res.status(400).json({ error: "User not found" });

    // Skip OTP: just confirm user exists
    console.log(`📲 Forgot password requested for phone: ${phone}`);
    res.json({ message: "User found. You can reset the password directly." });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================
// RESET PASSWORD (Participants Only)
// ============================
router.post("/reset-password", async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    if (!phone || !newPassword)
      return res.status(400).json({ error: "Phone and newPassword are required" });

    const authUser = await AuthUser.findOne({ phone });
    if (!authUser) return res.status(400).json({ error: "User not found" });

    authUser.password = newPassword;
    await authUser.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
