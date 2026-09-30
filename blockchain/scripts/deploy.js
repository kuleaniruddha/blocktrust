const hre = require("hardhat");

async function main() {
  const Donation = await hre.ethers.getContractFactory("Donation");
  const donation = await Donation.deploy();
  await donation.waitForDeployment();

  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();

  console.log("Donation:", await donation.getAddress());
  console.log("Treasury:", await treasury.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
