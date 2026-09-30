const Donation = require("../models/Donation");
const Expense = require("../models/Expense");
const User = require("../models/User");

async function dashboardMetrics() {
  const [donations, expenses, donors] = await Promise.all([
    Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
    Expense.aggregate([{ $match: { status: { $in: ["approved", "paid"] } } }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
    User.countDocuments({ role: "donor" })
  ]);
  const totalDonations = donations[0]?.total || 0;
  const totalExpenses = expenses[0]?.total || 0;
  return {
    totalDonations,
    totalExpenses,
    remainingBalance: totalDonations - totalExpenses,
    donationCount: donations[0]?.count || 0,
    expenseCount: expenses[0]?.count || 0,
    donors
  };
}

async function chartData() {
  const [monthlyDonations, expenseCategories] = await Promise.all([
    Donation.aggregate([
      { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, total: { $sum: "$amount" } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]),
    Expense.aggregate([{ $group: { _id: "$category", total: { $sum: "$amount" } } }])
  ]);
  return { monthlyDonations, expenseCategories };
}

module.exports = { dashboardMetrics, chartData };
