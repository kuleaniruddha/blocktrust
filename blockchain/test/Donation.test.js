const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Donation", function () {
  it("records donations immutably", async function () {
    const [donor] = await ethers.getSigners();
    const Donation = await ethers.getContractFactory("Donation");
    const donation = await Donation.deploy();

    await donation.donate("Ram Bhakt", "Construction", { value: ethers.parseEther("1") });
    const record = await donation.getDonation(0);

    expect(record.donor).to.equal(donor.address);
    expect(record.amount).to.equal(ethers.parseEther("1"));
    expect(await donation.totalDonated()).to.equal(ethers.parseEther("1"));
  });
});
