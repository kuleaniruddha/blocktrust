const Donation = require("../models/Donation");
const Receipt = require("../models/Receipt");
const { buildUpiUrl, generateQrDataUrl } = require("../services/qrService");
const { createReceiptPdf } = require("../services/pdfService");
const { getTransaction, treasuryWallet } = require("../services/blockchainService");
const { asyncHandler, receiptNumber } = require("../utils/helpers");

exports.createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const upiUrl = buildUpiUrl({ amount, note: `BlockTrust donation INR ${amount}` });
  res.json({ upiUrl, qrDataUrl: await generateQrDataUrl(upiUrl), walletAddress: treasuryWallet() });
});

exports.createDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.create({
    ...req.body,
    donor: req.user?._id,
    receiptNumber: receiptNumber(),
    status: req.body.transactionHash ? "confirmed" : "pending"
  });
  await Receipt.create({ receiptNumber: donation.receiptNumber, donation: donation._id });
  res.status(201).json(donation);
});

exports.myDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ donor: req.user?._id }).sort({ createdAt: -1 });
  res.json(donations);
});

exports.listDonations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.hash) filter.transactionHash = req.query.hash;
  if (req.query.wallet) filter.walletAddress = req.query.wallet;
  const donations = await Donation.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(donations);
});

exports.myDonations = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  const allDonations = await Donation.find().sort({ createdAt: -1 });
  const userDonations = allDonations.filter(
    (d) => String(d.donor) === String(req.user._id) || (req.user.email && d.email === req.user.email)
  );
  res.json(userDonations);
});

exports.getDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) return res.status(404).json({ message: "Donation not found" });
  res.json(donation);
});

exports.transactions = asyncHandler(async (_req, res) => {
  const donations = await Donation.find({ transactionHash: { $exists: true, $ne: "" } }).sort({ createdAt: -1 }).limit(50);
  res.json(donations);
});

exports.verifyTransaction = asyncHandler(async (req, res) => {
  res.json(await getTransaction(req.params.hash));
});

exports.receipt = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) return res.status(404).json({ message: "Donation not found" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${donation.receiptNumber}.pdf"`);
  createReceiptPdf(donation).pipe(res);
});
