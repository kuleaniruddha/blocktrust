const User = require("../models/User");
const Donation = require("../models/Donation");
const Expense = require("../models/Expense");
const { receiptNumber } = require("./helpers");

async function seedInitialData() {
  try {
    const existingAdmin = await User.findOne({ email: "admin@blocktrust.local" });
    if (!existingAdmin) {
      await User.create({
        name: "Trust Admin",
        email: "admin@blocktrust.local",
        password: "password123",
        role: "admin"
      });
    }

    const existingUser = await User.findOne({ email: "aniruddhakule@gmail.com" });
    if (!existingUser) {
      await User.create({
        name: "Aniruddha Kule",
        email: "aniruddhakule@gmail.com",
        password: "password123",
        role: "admin"
      });
    }

    const donationCount = await Donation.countDocuments();
    if (donationCount === 0) {
      const initialDonations = [
        {
          donorName: "Anand Sharma",
          email: "anand.sharma@example.com",
          amount: 0.25,
          currency: "ETH",
          purpose: "Shri Ram Mandir Development",
          paymentMode: "metamask",
          transactionHash: "0x8f3c47e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9",
          walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
          status: "confirmed",
          receiptNumber: receiptNumber()
        },
        {
          donorName: "Priya Patel",
          email: "priya.p@example.com",
          amount: 5001,
          currency: "INR",
          purpose: "Annakshetra & Food Service",
          paymentMode: "upi",
          transactionHash: "",
          walletAddress: "",
          status: "confirmed",
          receiptNumber: receiptNumber()
        },
        {
          donorName: "Rajesh Kumar",
          email: "rajesh.k@example.com",
          amount: 0.5,
          currency: "ETH",
          purpose: "Infrastructure & Security",
          paymentMode: "metamask",
          transactionHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
          walletAddress: "0x9876543210fedcba9876543210fedcba98765432",
          status: "confirmed",
          receiptNumber: receiptNumber()
        }
      ];

      for (const item of initialDonations) {
        await Donation.create(item);
      }
    }

    const expenseCount = await Expense.countDocuments();
    if (expenseCount === 0) {
      const initialExpenses = [
        {
          title: "Sandstone Carving & Pillar Engineering",
          category: "Temple Construction",
          amount: 450000,
          description: "Rajasthan pink sandstone carving, foundation reinforcement, and arch craftsmanship.",
          vendor: "Ayodhya Heritage Craftsmen Pvt Ltd",
          proofUrl: "",
          blockchainTxHash: "0x4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5",
          riskScore: 10,
          status: "approved"
        },
        {
          title: "Daily Annakshetra Meal Distribution (10,000 Pilgrims)",
          category: "Food & Prasadam",
          amount: 180000,
          description: "Sattvik bhojan ingredients, stainless steel kitchenware, and distribution logistics.",
          vendor: "Shri Ram Kitchen Trust",
          proofUrl: "",
          blockchainTxHash: "0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
          riskScore: 5,
          status: "approved"
        },
        {
          title: "Pilgrim Medical Center & Emergency First Aid",
          category: "Healthcare & Welfare",
          amount: 95000,
          description: "24/7 medical response center, ambulances, oxygen supply, and paramedic team.",
          vendor: "Sanjeevani HealthCare Ayodhya",
          proofUrl: "",
          blockchainTxHash: "0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
          riskScore: 12,
          status: "approved"
        },
        {
          title: "AI Security Surveillance & Crowd Management",
          category: "Security & Infrastructure",
          amount: 120000,
          description: "CCTV network installation, smart crowd flow sensors, and emergency sirens.",
          vendor: "SecureTrust Systems Ltd",
          proofUrl: "",
          blockchainTxHash: "0x9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
          riskScore: 15,
          status: "approved"
        }
      ];

      for (const exp of initialExpenses) {
        await Expense.create(exp);
      }
    }
  } catch (err) {
    console.error("Seeding initial data failed", err);
  }
}

module.exports = { seedInitialData };
