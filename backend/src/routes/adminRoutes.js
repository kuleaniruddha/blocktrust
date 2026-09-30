const router = require("express").Router();
const auth = require("../middleware/auth");
const permit = require("../middleware/admin");
const user = require("../controllers/userController");

router.get("/profile", auth, user.profile);
router.get("/users", auth, permit("admin", "auditor"), user.listUsers);
router.put("/users/:id", auth, permit("admin"), user.updateUser);
router.delete("/users/:id", auth, permit("admin"), user.deleteUser);

module.exports = router;
