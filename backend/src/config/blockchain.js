const { ethers } = require("ethers");

const donationAbi = [
  "function donate(string donorName,string purpose) external payable",
  "function totalDonated() view returns (uint256)",
  "event DonationReceived(uint256 indexed donationId,address indexed donor,uint256 amount,string donorName,string purpose,uint256 timestamp)"
];

function getProvider() {
  return new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545");
}

function getDonationContract() {
  if (!process.env.DONATION_CONTRACT_ADDRESS || !process.env.PRIVATE_KEY) return null;
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, getProvider());
  return new ethers.Contract(process.env.DONATION_CONTRACT_ADDRESS, donationAbi, wallet);
}

module.exports = { ethers, getProvider, getDonationContract, donationAbi };
