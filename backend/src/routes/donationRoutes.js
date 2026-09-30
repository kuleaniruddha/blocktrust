const router = require("express").Router();
const controller = require("../controllers/donationController");
const { auth, optionalAuth } = require("../middleware/auth");

router.post("/payment-intent", controller.createPaymentIntent);
router.post("/donate", auth, controller.createDonation);
router.get("/donations", controller.listDonations);
router.get("/donations/my", auth, controller.myDonations);
router.get("/donation/:id", controller.getDonation);
router.get("/donation/:id/receipt", controller.receipt);
router.get("/transactions", controller.transactions);
router.get("/transactions/:hash", controller.verifyTransaction);

module.exports = router;
