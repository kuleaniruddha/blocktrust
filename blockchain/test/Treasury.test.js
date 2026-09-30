const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Treasury", function () {
  it("prevents expenses above treasury balance", async function () {
    const [owner, vendor] = await ethers.getSigners();
    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy();
    await owner.sendTransaction({ to: await treasury.getAddress(), value: ethers.parseEther("1") });

    await expect(
      treasury.addExpense(vendor.address, ethers.parseEther("2"), "Construction", "Cement", "ipfs://bill", false)
    ).to.be.revertedWith("Insufficient treasury balance");
  });
});
