const router = require("express").Router();
const authController = require("../controllers/authController");
const { requireFields } = require("../middleware/validator");
const { auth: authMiddleware } = require("../middleware/auth");

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

router.post("/register", requireFields("name", "email", "password"), authController.register);
router.post("/login", requireFields("email", "password"), authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", requireFields("email"), authController.forgotPassword);
router.post("/reset-password", requireFields("token", "password"), authController.resetPassword);

router.get("/users", authMiddleware, adminOnly, authController.listUsers);
router.put("/users/:id/role", authMiddleware, adminOnly, authController.updateUserRole);

module.exports = router;
