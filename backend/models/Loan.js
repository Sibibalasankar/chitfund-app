const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  principalAmount: { type: Number, required: true }, // ✅ store principal
  interestRate: { type: Number, required: true },
  totalInstallments: { type: Number, required: true },
  paidInstallments: { type: Number, default: 0 },
  installmentAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  remainingAmount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["Pending", "Partially Paid", "Paid"], default: "Pending" },
  paymentDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Loan", loanSchema);
