const Expense = require("../models/Expense");
const { asyncHandler } = require("../utils/helpers");

function riskScore(amount) {
  if (amount >= 100000) return 90;
  if (amount >= 50000) return 70;
  if (amount >= 10000) return 45;
  return 15;
}

exports.createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create({
    ...req.body,
    proofUrl: req.file ? `/uploads/${req.file.filename}` : (req.body.proofUrl || ""),
    riskScore: riskScore(Number(req.body.amount || 0)),
    createdBy: req.user?._id || ""
  });
  res.status(201).json(expense);
});

exports.listExpenses = asyncHandler(async (req, res) => {
  const filter = req.query.category ? { category: req.query.category } : {};
  res.json(await Expense.find(filter).sort({ createdAt: -1 }));
});

exports.updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, { ...req.body, approvedBy: req.user?._id }, { new: true });
  if (!expense) return res.status(404).json({ message: "Expense not found" });
  res.json(expense);
});

exports.deleteExpense = asyncHandler(async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: "Expense deleted" });
});
