const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// Debug env check
console.log("Environment variables loaded:");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "✓ Loaded" : "✗ NOT LOADED");

const app = express();
app.use(cors());
app.use(express.json());

/* ===========================
   MONGODB CONNECTION
=========================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* ===========================
   HEALTH CHECK ROUTE (Render)
=========================== */
app.get("/", (req, res) => {
  res.send("✅ Chitfund Backend is running");
});

/* ===========================
   MODELS
=========================== */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: "participant" },
  status: { type: String, default: "active" },
  joinedDate: { type: Date, default: Date.now },
  totalPaid: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
});
const User = mongoose.model("User", userSchema);

const fundSchema = new mongoose.Schema({
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  paymentDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});
const Fund = mongoose.model("Fund", fundSchema);

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  phone: { type: String },
  type: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const Notification = mongoose.model("Notification", notificationSchema);

// ✅ Import AuthUser for login credentials
const AuthUser = require("./models/AuthUser");

/* ===========================
   USER ROUTES
=========================== */
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().sort({ joinedDate: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, phone, role } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const user = new User({ name, phone, role: role || "participant" });
    await user.save();

    await Notification.create({
      type: "user_added",
      message: `${user.name} has been added by admin.`,
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, phone, role, password } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, phone, role }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const authUser = await AuthUser.findOne({ phone: user.phone });
    if (authUser) {
      if (password) authUser.password = password;
      if (phone) authUser.phone = phone;
      if (role) authUser.role = role;
      await authUser.save();
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    await AuthUser.findOneAndDelete({ phone: user.phone });

    await Notification.create({
      type: "user_deleted",
      message: `${user.name} has been removed.`,
    });

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===========================
   FUND ROUTES
=========================== */
app.get("/api/funds", async (req, res) => {
  try {
    const funds = await Fund.find().populate("participantId", "name phone");
    res.json(funds);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/funds", async (req, res) => {
  try {
    const { participantId, amount, dueDate } = req.body;
    const fund = new Fund({ participantId, amount, dueDate, status: "pending" });
    await fund.save();

    await User.findByIdAndUpdate(participantId, { $inc: { pendingAmount: amount } });
    const user = await User.findById(participantId);

    await Notification.create({
      userId: participantId,
      phone: user.phone,
      type: "fund_added",
      message: `New fund of $${amount} added for ${user.name}.`,
    });

    res.status(201).json({ success: true, fund });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put("/api/funds/:id", async (req, res) => {
  try {
    const fund = await Fund.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fund) return res.status(404).json({ success: false, error: "Fund not found" });

    if (req.body.status === "paid") {
      await User.findByIdAndUpdate(fund.participantId, {
        $inc: { totalPaid: fund.amount, pendingAmount: -fund.amount },
      });

      const user = await User.findById(fund.participantId);
      await Notification.create({
        userId: fund.participantId,
        phone: user.phone,
        type: "payment_received",
        message: `Payment of $${fund.amount} received from ${user.name}.`,
      });
    }

    res.json({ success: true, fund });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete("/api/funds/:id", async (req, res) => {
  try {
    // Find the fund first
    const fund = await Fund.findById(req.params.id).populate("participantId", "name phone");
    if (!fund) return res.status(404).json({ success: false, error: "Fund not found" });

    // Store fund details for notification
    const participantName = fund.participantId?.name || "Unknown Participant";
    const participantPhone = fund.participantId?.phone || "N/A";
    const amount = fund.amount;
    const dueDate = fund.dueDate;
    const status = fund.status;

    // Delete the fund
    await fund.deleteOne();

    // Create a detailed notification
    await Notification.create({
  userId: fund.participantId?._id || null, // link to participant
  phone: participantPhone,
  type: "fund_deleted",
  message: `Fund deleted: Participant: ${participantName}, Amount: ₹${amount}, Due Date: ${dueDate}, Status: ${status}`,
  isRead: false, // mark as unread
});


    res.json({ success: true, message: "Fund deleted", fundId: fund._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


/* ===========================
   NOTIFICATION ROUTES
=========================== */
app.get("/api/notifications/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const notifications = await Notification.find({ phone }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!notification) return res.status(404).json({ success: false, error: "Notification not found" });
    res.json({ success: true, notification });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete("/api/notifications/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ success: false, error: "Notification not found" });
    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/notifications/mark-all-read", async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===========================
   AUTH ROUTES
=========================== */
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

/* ===========================
   START SERVER
=========================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
