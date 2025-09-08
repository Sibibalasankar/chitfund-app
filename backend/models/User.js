const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ["participant", "admin"], default: "participant" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    joinedDate: { type: Date, default: Date.now },
    totalPaid: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
