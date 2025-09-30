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
   HEALTH CHECK ROUTE
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

// 🔥 Updated bilingual Notification schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  phone: { type: String },
  type: { type: String, required: true },
  messageEn: { type: String, required: true },
  messageTa: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const Notification = mongoose.model("Notification", notificationSchema);

// ✅ Import AuthUser and Loan models
const AuthUser = require("./models/AuthUser");
const Loan = require("./models/Loan");

/* ===========================
   NOTIFICATION HELPER
=========================== */
function createNotification({ userId, phone, type, messageEn, messageTa }) {
  return Notification.create({
    userId,
    phone,
    type,
    messageEn,
    messageTa,
  });
}

/* ===========================
   LOAN ROUTES
=========================== */
app.post("/api/loans", async (req, res) => {
  try {
    const { participantId, principalAmount, totalInstallments, interestRate, startDate } = req.body;

    if (!participantId || !principalAmount || !totalInstallments) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Calculate totals
    const totalAmount = principalAmount + (principalAmount * (interestRate || 0) / 100);
    const installmentAmount = totalAmount / totalInstallments;
    const dueDate = new Date(startDate || Date.now());
    dueDate.setMonth(dueDate.getMonth() + totalInstallments);

    let loan = new Loan({
      participantId,
      principalAmount,
      interestRate: interestRate || 0,
      totalInstallments,
      paidInstallments: 0,
      installmentAmount,
      totalAmount,
      remainingAmount: totalAmount,
      startDate: startDate || new Date(),
      dueDate,
      status: "pending",
    });

    await loan.save();
    loan = await Loan.findById(loan._id).populate("participantId", "name phone");

    // Create bilingual notification
    const user = await User.findById(participantId);
    await createNotification({
      userId: participantId,
      phone: user.phone,
      type: "loan_added",
      messageEn: `New loan of ₹${principalAmount} assigned to ${user.name}.`,
      messageTa: `புதிய கடன் ₹${principalAmount} ${user.name}க்கு வழங்கப்பட்டுள்ளது.`,
    });

    res.status(201).json({ success: true, loan });
  } catch (err) {
    console.error("Error adding loan:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/loans", async (req, res) => {
  try {
    const loans = await Loan.find().populate("participantId", "name phone");
    res.json(loans);
  } catch (err) {
    console.error("Error fetching loans:", err);
    res.status(500).json({ message: "Failed to fetch loans" });
  }
});

app.put("/api/loans/:id", async (req, res) => {
  try {
    const { status, paidInstallments } = req.body;
    const updateData = {};

    if (status) updateData.status = status;
    if (paidInstallments !== undefined) {
      updateData.paidInstallments = paidInstallments;
      
      const loan = await Loan.findById(req.params.id);
      if (loan) {
        updateData.remainingAmount = loan.installmentAmount * (loan.totalInstallments - paidInstallments);
        if (paidInstallments >= loan.totalInstallments) {
          updateData.status = "paid";
        } else if (paidInstallments > 0) {
          updateData.status = "partially paid";
        } else {
          updateData.status = "pending";
        }
      }
    }

    const updatedLoan = await Loan.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("participantId", "name phone");

    if (!updatedLoan) return res.status(404).json({ success: false, error: "Loan not found" });

    res.json({ success: true, loan: updatedLoan });
  } catch (err) {
    console.error("Error updating loan:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/loans/:id", async (req, res) => {
  try {
    const loan = await Loan.findByIdAndDelete(req.params.id);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    const user = await User.findById(loan.participantId);
    await createNotification({
      userId: loan.participantId,
      phone: user.phone,
      type: "loan_deleted",
      messageEn: `Loan of ₹${loan.totalAmount} for ${user.name} has been deleted.`,
      messageTa: `₹${loan.totalAmount} கடன் ${user.name}க்கு நீக்கப்பட்டது.`,
    });

    res.json({ message: "Loan deleted successfully" });
  } catch (err) {
    console.error("Error deleting loan:", err);
    res.status(500).json({ message: "Failed to delete loan" });
  }
});

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

    await createNotification({
      type: "user_added",
      messageEn: `${user.name} has been added by admin.`,
      messageTa: `நிர்வாகி ${user.name} ஐ சேர்த்துள்ளார்.`,
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, phone, role, password, status } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (role) updateFields.role = role;
    if (status) updateFields.status = status;

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true });
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
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    await Loan.deleteMany({ participantId: userId });
    await Fund.deleteMany({ participantId: userId });
    await AuthUser.findOneAndDelete({ phone: user.phone });
    await user.deleteOne();

    await createNotification({
      type: "user_deleted",
      messageEn: `${user.name} and all related loans/funds have been removed.`,
      messageTa: `${user.name} மற்றும் அனைத்து கடன்கள்/நிதிகள் நீக்கப்பட்டுள்ளன.`,
    });

    res.json({ success: true, message: "User and related loans/funds deleted" });
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
    let fund = new Fund({ participantId, amount, dueDate, status: "pending" });
    await fund.save();

    await User.findByIdAndUpdate(participantId, { $inc: { pendingAmount: amount } });
    const user = await User.findById(participantId);

    await createNotification({
      userId: participantId,
      phone: user.phone,
      type: "fund_added",
      messageEn: `New fund of ₹${amount} added for ${user.name}.`,
      messageTa: `புதிய நிதி ₹${amount} ${user.name}க்கு சேர்க்கப்பட்டது.`,
    });

    fund = await Fund.findById(fund._id).populate("participantId", "name phone");

    res.status(201).json({ success: true, fund });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put("/api/funds/:id", async (req, res) => {
  try {
    const { status, amount, dueDate } = req.body;
    let fund = await Fund.findById(req.params.id);
    if (!fund) return res.status(404).json({ success: false, error: "Fund not found" });

    if (status) fund.status = status;
    if (amount !== undefined) fund.amount = amount;
    if (dueDate) fund.dueDate = dueDate;

    if (status === "paid") {
      await User.findByIdAndUpdate(fund.participantId, {
        $inc: { totalPaid: fund.amount, pendingAmount: -fund.amount },
      });

      const user = await User.findById(fund.participantId);
      await createNotification({
        userId: fund.participantId,
        phone: user.phone,
        type: "payment_received",
        messageEn: `Payment of ₹${fund.amount} received from ${user.name}.`,
        messageTa: `₹${fund.amount} கட்டணம் ${user.name} இலிருந்து பெறப்பட்டது.`,
      });
    }

    await fund.save();
    fund = await Fund.findById(fund._id).populate("participantId", "name phone");

    res.json({ success: true, fund });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete("/api/funds/:id", async (req, res) => {
  try {
    const fund = await Fund.findById(req.params.id).populate("participantId", "name phone");
    if (!fund) return res.status(404).json({ success: false, error: "Fund not found" });

    const participantName = fund.participantId?.name || "Unknown";
    const participantPhone = fund.participantId?.phone || "N/A";
    const amount = fund.amount;
    const dueDate = fund.dueDate;
    const status = fund.status;

    await fund.deleteOne();

    await createNotification({
      userId: fund.participantId?._id || null,
      phone: participantPhone,
      type: "fund_deleted",
      messageEn: `Fund deleted: ${participantName}, Amount: ₹${amount}, Due: ${dueDate}, Status: ${status}`,
      messageTa: `நிதி நீக்கப்பட்டது: ${participantName}, தொகை: ₹${amount}, காலக்கெடு: ${dueDate}, நிலை: ${status}`,
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
    const { lang } = req.query;

    let notifications = await Notification.find({ phone }).sort({ createdAt: -1 });

    if (lang === "en") {
      notifications = notifications.map(n => ({ ...n.toObject(), message: n.messageEn }));
    } else if (lang === "ta") {
      notifications = notifications.map(n => ({ ...n.toObject(), message: n.messageTa }));
    } else {
      notifications = notifications.map(n => ({
        ...n.toObject(),
        message: `${n.messageEn}\n${n.messageTa}`,
      }));
    }

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/notifications", async (req, res) => {
  try {
    const { lang } = req.query;
    let notifications = await Notification.find().sort({ createdAt: -1 });

    if (lang === "en") {
      notifications = notifications.map(n => ({ ...n.toObject(), message: n.messageEn }));
    } else if (lang === "ta") {
      notifications = notifications.map(n => ({ ...n.toObject(), message: n.messageTa }));
    } else {
      notifications = notifications.map(n => ({
        ...n.toObject(),
        message: `${n.messageEn}\n${n.messageTa}`,
      }));
    }

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
