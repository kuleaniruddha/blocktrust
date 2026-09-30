const router = require("express").Router();
const controller = require("../controllers/spendingController");
const auth = require("../middleware/auth");
const permit = require("../middleware/admin");
const upload = require("../middleware/upload");

router.post("/expense", auth, permit("admin", "trustee"), upload.single("proof"), controller.createExpense);
router.get("/expenses", controller.listExpenses);
router.put("/expense/:id", auth, permit("admin", "trustee"), controller.updateExpense);
router.delete("/expense/:id", auth, permit("admin", "trustee"), controller.deleteExpense);
router.delete("/expenses/:id", auth, permit("admin", "trustee"), controller.deleteExpense);

module.exports = router;
