const FirestoreModel = require("./firestoreModel");

const Notification = new FirestoreModel("notifications", {
  user: { type: String },
  title: { type: String },
  message: { type: String },
  type: { type: String, default: "system" },
  read: { type: Boolean, default: false }
});

module.exports = Notification;
