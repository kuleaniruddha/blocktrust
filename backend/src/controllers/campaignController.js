const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const { asyncHandler } = require("../utils/helpers");

exports.createCampaign = asyncHandler(async (req, res) => {
  if (!req.body.title || !req.body.targetAmount) {
    return res.status(400).json({ message: "Title and Target Amount are required." });
  }
  const campaign = await Campaign.create(req.body);
  res.status(201).json(campaign);
});

exports.listCampaigns = asyncHandler(async (req, res) => {
  const [campaigns, donations] = await Promise.all([
    Campaign.find({}).sort({ createdAt: -1 }),
    Donation.find({ status: "confirmed" })
  ]);

  // Aggregate donation amounts per campaign title in-memory (unified in INR)
  const campaignTotals = donations.reduce((acc, d) => {
    const purpose = d.purpose || "General";
    // Convert ETH to INR for uniform tracking (1 ETH = 3,00,000 INR)
    const amountInInr = d.currency === "ETH" ? Number(d.amount || 0) * 300000 : Number(d.amount || 0);
    acc[purpose] = (acc[purpose] || 0) + amountInInr;
    return acc;
  }, {});

  const campaignsWithRaised = campaigns.map((c) => {
    const raised = campaignTotals[c.title] || 0;
    return {
      ...c,
      raisedAmount: raised
    };
  });

  res.json(campaignsWithRaised);
});
