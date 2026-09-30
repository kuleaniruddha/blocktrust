const User = require("../models/User");
const { asyncHandler } = require("../utils/helpers");

exports.profile = asyncHandler(async (req, res) => res.json(req.user));
exports.listUsers = asyncHandler(async (_req, res) => res.json(await User.find().sort({ createdAt: -1 })));
exports.updateUser = asyncHandler(async (req, res) => res.json(await User.findByIdAndUpdate(req.params.id, req.body, { new: true })));
exports.deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});
