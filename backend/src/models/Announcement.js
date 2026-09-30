const FirestoreModel = require("./firestoreModel");

const Announcement = new FirestoreModel("announcements", {
  title: { type: String },
  message: { type: String },
  published: { type: Boolean, default: true },
  createdBy: { type: String }
});

module.exports = Announcement;
