const nodemailer = require("nodemailer");

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
}

async function sendMail(options) {
  const transporter = getTransporter();
  if (!transporter) return { skipped: true };
  return transporter.sendMail({ from: process.env.SMTP_USER, ...options });
}

module.exports = { sendMail };
