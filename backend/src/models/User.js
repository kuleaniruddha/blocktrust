const FirestoreModel = require("./firestoreModel");
const { ROLES } = require("../utils/constants");

const User = new FirestoreModel(
  "users",
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    role: { type: String, default: ROLES.DONOR },
    walletAddress: { type: String },
    phone: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
  },
  null,
  {
    comparePassword: async function (candidate) {
      if (!this.password) return false;
      const candidateStr = String(candidate).trim();
      const storedStr = String(this.password).trim();
      if (storedStr === candidateStr) return true;
      if (storedStr.startsWith("$2a$") || storedStr.startsWith("$2b$") || storedStr.startsWith("$2y$")) {
        try {
          const bcrypt = require("bcryptjs");
          return await bcrypt.compare(candidateStr, storedStr);
        } catch (e) {
          return false;
        }
      }
      return false;
    }
  }
);

module.exports = User;
