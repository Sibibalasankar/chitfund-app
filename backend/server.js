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
   NOTIFICATION SERVICE - Bilingual
=========================== */
const NotificationService = {
  // Loan related notifications
  loanAdded: (userName, amount) => ({
    english: `New loan of ₹${amount} assigned to ${userName}.`,
    tamil: `புதிய கடன் ₹${amount} ${userName}க்கு வழங்கப்பட்டது.`
  }),

  loanUpdated: (userName, amount, status) => ({
    english: `Loan of ₹${amount} for ${userName} has been ${status}.`,
    tamil: `₹${amount} கடன் ${userName}க்கு ${this.getTamilStatus(status)}ப்பட்டது.`
  }),

  loanDeleted: (userName, amount) => ({
    english: `Loan of ₹${amount} for ${userName} has been deleted.`,
    tamil: `₹${amount} கடன் ${userName}க்கு நீக்கப்பட்டது.`
  }),

  // Fund related notifications
  fundAdded: (userName, amount) => ({
    english: `New fund of ₹${amount} added for ${userName}.`,
    tamil: `புதிய நிதி ₹${amount} ${userName}க்கு சேர்க்கப்பட்டது.`
  }),

  fundUpdated: (userName, amount, status) => ({
    english: `Fund of ₹${amount} for ${userName} has been ${status}.`,
    tamil: `₹${amount} நிதி ${userName}க்கு ${this.getTamilStatus(status)}ப்பட்டது.`
  }),

  fundDeleted: (userName, amount, dueDate, status) => ({
    english: `Fund deleted: ${userName}, Amount: ₹${amount}, Due: ${dueDate}, Status: ${status}`,
    tamil: `நிதி நீக்கப்பட்டது: ${userName}, தொகை: ₹${amount}, காலக்கெடு: ${dueDate}, நிலை: ${this.getTamilStatus(status)}`
  }),

  // Payment related notifications
  paymentReceived: (userName, amount) => ({
    english: `Payment of ₹${amount} received from ${userName}.`,
    tamil: `₹${amount} தொகை ${userName}விடமிருந்து பெறப்பட்டது.`
  }),

  // User related notifications
  userAdded: (userName) => ({
    english: `${userName} has been added by admin.`,
    tamil: `${userName} நிர்வாகியால் சேர்க்கப்பட்டார்.`
  }),

  userUpdated: (userName) => ({
    english: `${userName}'s details have been updated.`,
    tamil: `${userName}வின் விவரங்கள் புதுப்பிக்கப்பட்டன.`
  }),

  userDeleted: (userName) => ({
    english: `${userName} and all related loans/funds have been removed.`,
    tamil: `${userName} மற்றும் அனைத்து தொடர்புடைய கடன்/நிதி நீக்கப்பட்டன.`
  }),

  // System notifications
  systemAlert: (message) => ({
    english: `System Alert: ${message}`,
    tamil: `அமைப்பு எச்சரிக்கை: ${message}`
  }),

  // Helper function to get Tamil status
  getTamilStatus: (status) => {
    const statusMap = {
      'paid': 'செலுத்தப்பட்ட',
      'pending': 'நிலுவையில்',
      'completed': 'முடிக்கப்பட்ட',
      'updated': 'புதுப்பிக்கப்பட்ட',
      'deleted': 'நீக்கப்பட்ட',
      'added': 'சேர்க்கப்பட்ட'
    };
    return statusMap[status] || status;
  }
};

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
  languagePreference: { type: String, default: "english" } // 'english' or 'tamil'
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
  message: { 
    english: { type: String, required: true },
    tamil: { type: String, required: true }
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  languagePreference: { type: String, default: "english" }
});
const Notification = mongoose.model("Notification", notificationSchema);

// ✅ Import AuthUser for login credentials
const AuthUser = require("./models/AuthUser");
const Loan = require("./models/Loan");

/* ===========================
   LOAN ROUTES
=========================== */

// Loan Routes
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
    const notificationMsg = NotificationService.loanAdded(user.name, principalAmount);
    
    await Notification.create({
      userId: participantId,
      phone: user.phone,
      type: "loan_added",
      message: notificationMsg,
      languagePreference: user.languagePreference || "english"
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
      
      // Recalculate remaining amount
      const loan = await Loan.findById(req.params.id);
      if (loan) {
        updateData.remainingAmount = 
          loan.installmentAmount * (loan.totalInstallments - paidInstallments);
        
        // Auto-update status based on payments
        if (paidInstallments >= loan.totalInstallments) {
          updateData.status = "paid";
        } else if (paidInstallments > 0) {
          updateData.status = "partially paid";
        } else {
          updateData.status = "pending";
        }
      }
    }

    const updatedLoan = await Loan.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).populate("participantId", "name phone");

    if (!updatedLoan) {
      return res.status(404).json({ success: false, error: "Loan not found" });
    }

    // Create notification for loan update
    const user = await User.findById(updatedLoan.participantId);
    const notificationMsg = NotificationService.loanUpdated(
      user.name, 
      updatedLoan.principalAmount, 
      "updated"
    );
    
    await Notification.create({
      userId: updatedLoan.participantId,
      phone: user.phone,
      type: "loan_updated",
      message: notificationMsg,
      languagePreference: user.languagePreference || "english"
    });

    res.json({ success: true, loan: updatedLoan });
  } catch (err) {
    console.error("Error updating loan:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/loans/:id", async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    const user = await User.findById(loan.participantId);
    const notificationMsg = NotificationService.loanDeleted(user.name, loan.totalAmount);
    
    await Notification.create({
      userId: loan.participantId,
      phone: user.phone,
      type: "loan_deleted",
      message: notificationMsg,
      languagePreference: user.languagePreference || "english"
    });

    await Loan.findByIdAndDelete(req.params.id);

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
    const { name, phone, role, languagePreference } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const user = new User({ 
      name, 
      phone, 
      role: role || "participant",
      languagePreference: languagePreference || "english"
    });
    await user.save();

    const notificationMsg = NotificationService.userAdded(user.name);
    
    await Notification.create({
      type: "user_added",
      message: notificationMsg,
      languagePreference: "english"
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, phone, role, password, status, languagePreference } = req.body;

    // Include status if provided
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (role) updateFields.role = role;
    if (status) updateFields.status = status;
    if (languagePreference) updateFields.languagePreference = languagePreference;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    // Sync with AuthUser if phone/role/password changed
    const authUser = await AuthUser.findOne({ phone: user.phone });
    if (authUser) {
      if (password) authUser.password = password;
      if (phone) authUser.phone = phone;
      if (role) authUser.role = role;
      await authUser.save();
    }

    // Create notification for user update
    const notificationMsg = NotificationService.userUpdated(user.name);
    
    await Notification.create({
      userId: user._id,
      phone: user.phone,
      type: "user_updated",
      message: notificationMsg,
      languagePreference: user.languagePreference || "english"
    });

    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Find the user first
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    // 2. Delete related Loans & Funds
    await Loan.deleteMany({ participantId: userId });
    await Fund.deleteMany({ participantId: userId });

    // 3. Delete user login credentials
    await AuthUser.findOneAndDelete({ phone: user.phone });

    // 4. Create notification before deleting user
    const notificationMsg = NotificationService.userDeleted(user.name);
    
    await Notification.create({
      type: "user_deleted",
      message: notificationMsg,
      languagePreference: "english"
    });

    // 5. Delete the User
    await user.deleteOne();

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

    // Update user's pending amount
    await User.findByIdAndUpdate(participantId, { $inc: { pendingAmount: amount } });
    const user = await User.findById(participantId);

    const notificationMsg = NotificationService.fundAdded(user.name, amount);
    
    await Notification.create({
      userId: participantId,
      phone: user.phone,
      type: "fund_added",
      message: notificationMsg,
      languagePreference: user.languagePreference || "english"
    });

    // 🔥 Populate before sending back
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

    if (status === "paid" && fund.status !== "paid") {
      await User.findByIdAndUpdate(fund.participantId, {
        $inc: { totalPaid: fund.amount, pendingAmount: -fund.amount },
      });

      const user = await User.findById(fund.participantId);
      const paymentNotification = NotificationService.paymentReceived(user.name, fund.amount);
      
      await Notification.create({
        userId: fund.participantId,
        phone: user.phone,
        type: "payment_received",
        message: paymentNotification,
        languagePreference: user.languagePreference || "english"
      });
    }

    await fund.save();

    // Create fund update notification
    const user = await User.findById(fund.participantId);
    const updateNotification = NotificationService.fundUpdated(user.name, fund.amount, "updated");
    
    await Notification.create({
      userId: fund.participantId,
      phone: user.phone,
      type: "fund_updated",
      message: updateNotification,
      languagePreference: user.languagePreference || "english"
    });

    // ✅ Populate before sending back
    fund = await Fund.findById(fund._id).populate("participantId", "name phone");

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
    const dueDate = fund.dueDate.toISOString().split('T')[0];
    const status = fund.status;

    const notificationMsg = NotificationService.fundDeleted(participantName, amount, dueDate, status);
    
    await Notification.create({
      userId: fund.participantId?._id || null,
      phone: participantPhone,
      type: "fund_deleted",
      message: notificationMsg,
      languagePreference: fund.participantId?.languagePreference || "english"
    });

    // Delete the fund
    await fund.deleteOne();

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
    
    // Get user's language preference
    const user = await User.findOne({ phone });
    const userLanguage = user?.languagePreference || "english";
    
    // Format notifications based on user's language preference
    const formattedNotifications = notifications.map(notification => ({
      _id: notification._id,
      userId: notification.userId,
      phone: notification.phone,
      type: notification.type,
      message: notification.message[userLanguage] || notification.message.english,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      languagePreference: userLanguage
    }));
    
    res.json(formattedNotifications);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/notifications", async (req, res) => {
  try {
    const { language = "english" } = req.query;
    const notifications = await Notification.find().sort({ createdAt: -1 });
    
    // Format notifications based on requested language
    const formattedNotifications = notifications.map(notification => ({
      _id: notification._id,
      userId: notification.userId,
      phone: notification.phone,
      type: notification.type,
      message: notification.message[language] || notification.message.english,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      languagePreference: language
    }));
    
    res.json(formattedNotifications);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, 
      { isRead: true }, 
      { new: true }
    );
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

// New endpoint to get notifications in specific language
app.get("/api/notifications/user/:userId/language", async (req, res) => {
  try {
    const { userId } = req.params;
    const { lang = "english" } = req.query;
    
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    
    const formattedNotifications = notifications.map(notification => ({
      _id: notification._id,
      userId: notification.userId,
      phone: notification.phone,
      type: notification.type,
      message: notification.message[lang] || notification.message.english,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      languagePreference: lang
    }));
    
    res.json(formattedNotifications);
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