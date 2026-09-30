const FirestoreModel = require("./firestoreModel");

const schema = {
  title: { type: String, required: true },
  description: { type: String },
  targetAmount: { type: Number, required: true },
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: () => new Date() }
};

module.exports = new FirestoreModel("campaigns", schema);
