const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");

function formatDate(dateVal) {
  try {
    if (!dateVal) return new Date().toLocaleString("en-IN");
    if (typeof dateVal.toISOString === "function") return dateVal.toLocaleString("en-IN");
    const parsed = new Date(dateVal);
    if (!isNaN(parsed.getTime())) return parsed.toLocaleString("en-IN");
    return String(dateVal);
  } catch (e) {
    return new Date().toLocaleString("en-IN");
  }
}

function createReceiptPdf(donation) {
  const doc = new PDFDocument({ margin: 48 });
  const stream = new PassThrough();
  doc.pipe(stream);

  // Title / Header
  doc.fillColor("#B45309").fontSize(20).text("Shri Ram Mandir Trust", { align: "center" });
  doc.fillColor("#1C1917").fontSize(14).text("Official Blockchain Crowd Funding Donation Receipt", { align: "center" });
  doc.moveDown(1.5);

  // Content Box
  doc.fontSize(11).fillColor("#292524");
  doc.text(`Receipt Number: `, { continued: true }).font("Helvetica-Bold").text(`${donation.receiptNumber || "N/A"}`).font("Helvetica");
  doc.moveDown(0.5);

  doc.text(`Donor Name: `, { continued: true }).font("Helvetica-Bold").text(`${donation.donorName || "Anonymous Donor"}`).font("Helvetica");
  doc.moveDown(0.5);

  doc.text(`Donation Amount: `, { continued: true }).font("Helvetica-Bold").text(`${donation.amount} ${donation.currency}`).font("Helvetica");
  doc.moveDown(0.5);

  doc.text(`Purpose / Allocation: `, { continued: true }).font("Helvetica-Bold").text(`${donation.purpose || "Shri Ram Mandir Development"}`).font("Helvetica");
  doc.moveDown(0.5);

  doc.text(`Payment Mode: `, { continued: true }).font("Helvetica-Bold").text(`${donation.paymentMode || "Blockchain Crypto"}`).font("Helvetica");
  doc.moveDown(0.5);

  doc.text(`Target Wallet Account: `, { continued: true }).font("Helvetica-Bold").text(`${donation.walletAddress || "N/A"}`).font("Helvetica");
  doc.moveDown(0.5);

  doc.text(`Blockchain Tx Hash: `, { continued: true }).font("Helvetica-Bold").text(`${donation.transactionHash || "N/A"}`).font("Helvetica");
  doc.moveDown(0.5);

  doc.text(`Date & Time: `, { continued: true }).font("Helvetica-Bold").text(`${formatDate(donation.createdAt)}`).font("Helvetica");
  doc.moveDown(1.5);

  // Footer / Verification notice
  doc.fillColor("#78350F").fontSize(9).text("--------------------------------------------------------------------------------------------------", { align: "center" });
  doc.fontSize(9).text("This receipt is cryptographically verified and recorded on the BlockTrust Ram Mandir Ledger.", { align: "center" });
  doc.text("Thank you for your generous contribution towards Shri Ram Mandir, Ayodhya.", { align: "center" });

  doc.end();
  return stream;
}

module.exports = { createReceiptPdf };
