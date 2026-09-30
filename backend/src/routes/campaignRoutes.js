const router = require("express").Router();
const controller = require("../controllers/campaignController");
const { auth } = require("../middleware/auth");

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

router.post("/campaigns", auth, adminOnly, controller.createCampaign);
router.get("/campaigns", controller.listCampaigns);

module.exports = router;
