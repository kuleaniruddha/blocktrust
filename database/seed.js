const path = require("path");
module.paths.push(path.join(__dirname, "..", "backend", "node_modules"));

require("dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const connectDB = require("../backend/src/config/db");
const User = require("../backend/src/models/User");
const Donation = require("../backend/src/models/Donation");
const Expense = require("../backend/src/models/Expense");

async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany(), Donation.deleteMany(), Expense.deleteMany()]);
  const admin = await User.create({ name: "Admin", email: "admin@blocktrust.local", password: "password123", role: "admin" });
  await Donation.create({ donorName: "Sample Donor", amount: 1100, currency: "INR", purpose: "Construction", status: "confirmed", receiptNumber: "BT-2026-DEMO" });
  await Expense.create({ title: "Cement purchase", category: "Construction", amount: 8500, status: "approved", createdBy: admin._id, riskScore: 15 });
  console.log("Seeded BlockTrust database successfully");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
