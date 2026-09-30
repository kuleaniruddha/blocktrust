const fs = require("fs");
const path = require("path");
const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const logger = require("../utils/logger");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "local_db.json");

function loadDbFile() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    logger.error("Error reading local DB file, starting fresh:", e.message);
  }
  return {};
}

function saveDbFile(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    logger.error("Error writing to local DB file:", e.message);
  }
}

class MockDocRef {
  constructor(collection, id) {
    this.collection = collection;
    this.id = id || Math.random().toString(36).substring(2, 15);
  }
  async get() {
    const data = this.collection.store[this.id];
    return {
      exists: data !== undefined,
      data: () => (data ? JSON.parse(JSON.stringify(data)) : undefined)
    };
  }
  async set(data, options = {}) {
    const current = this.collection.store[this.id] || {};
    if (options.merge) {
      this.collection.store[this.id] = { ...current, ...data };
    } else {
      this.collection.store[this.id] = { ...data };
    }
    if (this.collection.firestore) {
      this.collection.firestore.save();
    }
  }
  async delete() {
    delete this.collection.store[this.id];
    if (this.collection.firestore) {
      this.collection.firestore.save();
    }
  }
}

class MockCollection {
  constructor(name, firestore) {
    this.name = name;
    this.firestore = firestore;
    this.store = {};
  }
  doc(id) {
    return new MockDocRef(this, id);
  }
  async get() {
    const docs = Object.keys(this.store).map((id) => {
      const data = this.store[id];
      return {
        id,
        ref: new MockDocRef(this, id),
        data: () => JSON.parse(JSON.stringify(data))
      };
    });
    return docs;
  }
}

class MockFirestore {
  constructor() {
    this.collections = {};
    const persisted = loadDbFile();
    for (const [colName, store] of Object.entries(persisted)) {
      this.collection(colName);
      this.collections[colName].store = store;
    }
  }
  save() {
    const raw = {};
    for (const [colName, col] of Object.entries(this.collections)) {
      raw[colName] = col.store;
    }
    saveDbFile(raw);
  }
  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new MockCollection(name, this);
    }
    return this.collections[name];
  }
  batch() {
    const operations = [];
    return {
      delete: (docRef) => {
        operations.push(() => docRef.delete());
      },
      commit: async () => {
        for (const op of operations) {
          await op();
        }
        this.save();
      }
    };
  }
}

let db = null;
let mockInstance = new MockFirestore();
let isMock = false;

async function connectDB() {
  try {
    if (db) return db;

    if (process.env.USE_LOCAL_DB === "true") {
      logger.info("Using Local Persistent JSON Database (USE_LOCAL_DB=true)");
      db = mockInstance;
      isMock = true;
      return db;
    }

    const hasServiceAccount = !!process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const hasEnvVars = !!(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    );
    const hasEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;

    if (hasServiceAccount || hasEnvVars || hasEmulator) {
      try {
        if (getApps().length === 0) {
          if (hasServiceAccount) {
            const path = require("path");
            const fs = require("fs");
            const candidatePaths = [
              path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
              path.join(__dirname, "..", process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
              path.join(process.cwd(), "backend", process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
              path.join(__dirname, "..", "..", process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
            ];
            const resolvedPath = candidatePaths.find(p => fs.existsSync(p));
            if (!resolvedPath) {
              throw new Error(`Service account file not found at ${process.env.FIREBASE_SERVICE_ACCOUNT_PATH}`);
            }
            const serviceAccount = require(resolvedPath);
            initializeApp({
              credential: cert(serviceAccount)
            });
            logger.info(`Firebase initialized with Service Account JSON from ${resolvedPath}`);
          } else if (hasEnvVars) {
            initializeApp({
              credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL
              })
            });
            logger.info("Firebase initialized with environment variables");
          } else if (hasEmulator) {
            const projectId = process.env.FIREBASE_PROJECT_ID || "blocktrust-dev";
            initializeApp({ projectId });
            logger.info(`Firebase initialized for Emulator with project ${projectId}`);
          }
        }
        const candidateDb = getFirestore();
        candidateDb.settings({ ignoreUndefinedProperties: true });
        // Verify credentials with a quick check
        await candidateDb.collection("_health_check").limit(1).get();
        db = candidateDb;
        logger.info("Connected to Firebase Firestore successfully");
        return db;
      } catch (authErr) {
        logger.warn(
          `Firebase authentication failed (${authErr.message || authErr}). Falling back to Local Persistent JSON Database.`
        );
        db = mockInstance;
        isMock = true;
        return db;
      }
    } else {
      logger.warn("No Firebase credentials detected in .env.");
      logger.info("Falling back to Local Persistent JSON Database.");
      db = mockInstance;
      isMock = true;
      return db;
    }
  } catch (error) {
    logger.error("Firebase connection initialization failed, using Local Persistent Database", error);
    db = mockInstance;
    isMock = true;
    return db;
  }
}

module.exports = connectDB;
module.exports.getApps = getApps;
module.exports.getFirestore = getFirestore;
module.exports.isMockDb = () => isMock;
Object.defineProperty(module.exports, "db", {
  get: () => {
    return db || mockInstance;
  }
});
