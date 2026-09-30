const FirestoreModel = require("./firestoreModel");

const AuditLog = new FirestoreModel("auditlogs", {
  actor: { type: String },
  action: { type: String },
  resource: { type: String },
  resourceId: { type: String },
  metadata: { type: Object },
  ipAddress: { type: String }
});

module.exports = AuditLog;
