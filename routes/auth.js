const express = require("express");
const jwt = require("jsonwebtoken");
const AuthUser = require("../models/AuthUser");   // 🔹 Participants login/register
const User = require("../models/User");           // 🔹 Profile data
const AdminUser = require("../models/AdminUser"); // 🔹 Admins login
const twilio = require("twilio");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Temporary OTP store (replace with Redis/DB in production)
let otpStore = {};

/* ============================
   REGISTER (Participants Only)
============================ */
router.post("/register", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res
        .status(400)
        .json({ error: "Phone and password are required" });
    }

    const existing = await AuthUser.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: "Phone already registered" });
    }

    const authUser = new AuthUser({
      phone,
      password, // bcrypt handled in schema
      role: "participant",
    });
    await authUser.save();

    const token = jwt.sign(
      { id: authUser._id, role: "participant" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: authUser._id,
        phone: authUser.phone,
        role: authUser.role,
      },
      token,
    });
  } catch (err) {
    console.error("🔥 Register error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   LOGIN (Admin + Participants)
============================ */
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log("📩 Login attempt:", { phone, password });

    if (!phone || !password) {
      return res.status(400).json({ error: "Phone and password are required" });
    }

    let userDoc = await AdminUser.findOne({ phone }).select("+password");
    let userType = "admin";

    if (!userDoc) {
      userDoc = await AuthUser.findOne({ phone }).select("+password");
      userType = "participant";
    }

    if (!userDoc) {
      console.log("❌ No user found for phone:", phone);
      return res.status(400).json({ error: "User not found" });
    }

    console.log("🔑 Found user:", { userType, phone: userDoc.phone, role: userDoc.role });

    const isMatch = await userDoc.comparePassword(password);
    console.log("🔐 Password match?", isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: userDoc._id, role: userDoc.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    let user;
    if (userType === "admin") {
      user = {
        id: userDoc._id,
        name: userDoc.name || "Admin",
        phone: userDoc.phone,
        role: "admin",
      };
    } else {
      user = await User.findOne({ phone });
    }

    res.json({ user, token });
  } catch (err) {
    console.error("🔥 Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   FORGOT PASSWORD (Users Only)
============================ */
router.post("/forgot-password", async (req, res) => {
  try {
    const { phone } = req.body;
    const authUser = await AuthUser.findOne({ phone });
    if (!authUser) return res.status(400).json({ error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    // ✅ Send OTP via SMS
    await client.messages.create({
      body: `Your Chit Fund OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`, // ⚠️ Only verified numbers work on Twilio trial
    });

    // 🔹 Also log OTP for testing (remove in production)
    console.log(`📲 OTP for ${phone}: ${otp}`);

    res.json({ message: "OTP sent via SMS" });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   RESET PASSWORD (Users Only)
============================ */
router.post("/reset-password", async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    const otpData = otpStore[phone];
    if (!otpData) return res.status(400).json({ error: "No OTP found" });

    if (otpData.expiresAt < Date.now()) {
      delete otpStore[phone];
      return res.status(400).json({ error: "OTP expired" });
    }

    if (otpData.otp !== otp)
      return res.status(400).json({ error: "Invalid OTP" });

    const authUser = await AuthUser.findOne({ phone });
    if (!authUser) return res.status(400).json({ error: "User not found" });

    authUser.password = newPassword;
    await authUser.save();

    delete otpStore[phone];
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
