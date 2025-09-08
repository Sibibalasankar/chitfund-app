// seedAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chitfund";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    const adminCollection = mongoose.connection.collection("admin");

    // clear any old admin
    await adminCollection.deleteMany({ phone: "9876543210" });

    // hash the password ONCE
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await adminCollection.insertOne({
      phone: "9876543210",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin seeded successfully: 9876543210 / admin123");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    process.exit(1);
  }
}

seedAdmin();
