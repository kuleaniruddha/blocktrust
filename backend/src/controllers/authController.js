const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { asyncHandler } = require("../utils/helpers");

function sign(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

exports.register = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  const userObj = { ...user };
  delete userObj.password;
  res.status(201).json({ token: sign(user), user: userObj });
});

exports.login = asyncHandler(async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password;

  const users = await User.find({});
  const user = users.find(u => (u.email || "").trim().toLowerCase() === email);

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const userObj = { ...user };
  delete userObj.password;
  res.json({ token: sign(user), user: userObj });
});

exports.logout = (_req, res) => res.json({ message: "Logged out on client" });

exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json({ message: "If the email exists, a reset token was generated" });
  user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();
  res.json({ resetToken: user.resetPasswordToken });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: new Date() } });
  if (!user) return res.status(400).json({ message: "Invalid reset token" });
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: "Password reset successful" });
});

exports.listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.json(users);
});

exports.updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.role = req.body.role;
  await user.save();
  res.json(user);
});
