const FirestoreModel = require("./firestoreModel");

const Receipt = new FirestoreModel("receipts", {
  receiptNumber: { type: String },
  donation: { type: String },
  pdfPath: { type: String },
  verificationQr: { type: String }
});

module.exports = Receipt;
