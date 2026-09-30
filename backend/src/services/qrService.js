const QRCode = require("qrcode");

function buildUpiUrl({ amount, note = "BlockTrust Donation" }) {
  const pa = process.env.PAYMENT_UPI_ID;
  const pn = process.env.PAYMENT_PAYEE_NAME || "BlockTrust";
  if (!pa) throw new Error("PAYMENT_UPI_ID is not configured");
  const params = new URLSearchParams({
    pa,
    pn,
    am: String(amount),
    cu: "INR",
    tn: note
  });
  return `upi://pay?${params.toString()}`;
}

async function generateQrDataUrl(text) {
  return QRCode.toDataURL(text, { margin: 1, width: 280 });
}

module.exports = { buildUpiUrl, generateQrDataUrl };
