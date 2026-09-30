const hre = require("hardhat");

async function main() {
  const [donationAddress, treasuryAddress] = process.argv.slice(2);
  if (!donationAddress || !treasuryAddress) {
    throw new Error("Usage: node scripts/verify.js <donationAddress> <treasuryAddress>");
  }
  await hre.run("verify:verify", { address: donationAddress, constructorArguments: [] });
  await hre.run("verify:verify", { address: treasuryAddress, constructorArguments: [] });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
