const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const authUserSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["participant"], default: "participant" },
  },
  { timestamps: true }
);

// Hash password before save
authUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Compare password method (for login)
authUserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports =
  mongoose.models.AuthUser || mongoose.model("AuthUser", authUserSchema);
