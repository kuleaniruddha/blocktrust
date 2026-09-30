const FirestoreModel = require("./firestoreModel");

const Donation = new FirestoreModel("donations", {
  donor: { type: String },
  donorName: { type: String, default: "Anonymous" },
  email: { type: String },
  walletAddress: { type: String },
  amount: { type: Number, default: 0 },
  currency: { type: String, default: "INR" },
  purpose: { type: String, default: "General Donation" },
  transactionHash: { type: String },
  blockNumber: { type: Number },
  paymentMode: { type: String, default: "manual" },
  status: { type: String, default: "pending" },
  receiptNumber: { type: String }
});

module.exports = Donation;
