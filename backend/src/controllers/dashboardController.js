const Donation = require("../models/Donation");
const Expense = require("../models/Expense");
const { dashboardMetrics, chartData } = require("../services/analyticsService");
const { asyncHandler } = require("../utils/helpers");

exports.dashboard = asyncHandler(async (_req, res) => {
  const [metrics, recentTransactions, recentExpenses] = await Promise.all([
    dashboardMetrics(),
    Donation.find().sort({ createdAt: -1 }).limit(8),
    Expense.find().sort({ createdAt: -1 }).limit(8)
  ]);
  res.json({ metrics, recentTransactions, recentExpenses, blockchainStatus: "configurable", network: "Sepolia" });
});

exports.analytics = asyncHandler(async (_req, res) => res.json(await chartData()));
