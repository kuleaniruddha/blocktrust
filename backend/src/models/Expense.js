const FirestoreModel = require("./firestoreModel");

const Expense = new FirestoreModel("expenses", {
  title: { type: String },
  category: { type: String },
  amount: { type: Number, default: 0 },
  description: { type: String },
  vendor: { type: String },
  proofUrl: { type: String },
  blockchainTxHash: { type: String },
  riskScore: { type: Number, default: 0 },
  status: { type: String, default: "pending" },
  createdBy: { type: String },
  approvedBy: { type: String }
});

module.exports = Expense;
