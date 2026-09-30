const { ethers, getProvider } = require("../config/blockchain");

async function getTransaction(hash) {
  if (!hash) return null;
  const provider = getProvider();
  const tx = await provider.getTransaction(hash);
  const receipt = await provider.getTransactionReceipt(hash).catch(() => null);
  return { tx, receipt };
}

function treasuryWallet() {
  return process.env.DONATION_WALLET_ADDRESS || "";
}

function weiToEth(value) {
  return ethers.formatEther(value || 0);
}

module.exports = { getTransaction, treasuryWallet, weiToEth };
