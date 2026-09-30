const path = require("path");
module.paths.push(path.join(__dirname, "..", "backend", "node_modules"));

require("dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

// Explicitly override service account path relative to the backend directory
process.env.FIREBASE_SERVICE_ACCOUNT_PATH = path.join(__dirname, "..", "backend", "firebase-credentials.json");

const connectDB = require("../backend/src/config/db");
const Donation = require("../backend/src/models/Donation");
const Expense = require("../backend/src/models/Expense");
const Receipt = require("../backend/src/models/Receipt");

async function clearDatabase() {
  console.log("Connecting to Firebase...");
  await connectDB();
  
  console.log("Clearing donations, expenses, and receipts collections...");
  await Promise.all([
    Donation.deleteMany(),
    Expense.deleteMany(),
    Receipt.deleteMany()
  ]);
  
  console.log("Database cleared successfully! Clean slate is ready.");
  process.exit(0);
}

clearDatabase().catch((err) => {
  console.error("Failed to clear database:", err);
  process.exit(1);
});
