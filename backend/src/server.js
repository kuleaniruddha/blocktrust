const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const { seedInitialData } = require("./utils/seedData");

const port = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    // Seeding disabled to preserve only real Firebase data
    app.listen(port, () => logger.info(`API running on http://localhost:${port}`));
  })
  .catch((error) => {
    logger.error("Failed to start server", error);
    process.exit(1);
  });
