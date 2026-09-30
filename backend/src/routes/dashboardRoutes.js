const router = require("express").Router();
const controller = require("../controllers/dashboardController");

router.get("/dashboard", controller.dashboard);
router.get("/analytics", controller.analytics);

module.exports = router;
