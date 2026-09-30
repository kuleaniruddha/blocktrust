const crypto = require("crypto");

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const receiptNumber = () => `BT-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

module.exports = { asyncHandler, receiptNumber };
