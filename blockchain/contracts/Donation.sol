// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./AccessControl.sol";

contract Donation is BlockTrustAccessControl {
    struct DonationRecord {
        address donor;
        string donorName;
        uint256 amount;
        uint256 timestamp;
        string purpose;
        string status;
    }

    DonationRecord[] private donations;
    uint256 public totalDonated;

    event DonationReceived(
        uint256 indexed donationId,
        address indexed donor,
        uint256 amount,
        string donorName,
        string purpose,
        uint256 timestamp
    );

    function donate(string calldata donorName, string calldata purpose) external payable {
        require(msg.value > 0, "Donation must be positive");
        donations.push(DonationRecord(msg.sender, donorName, msg.value, block.timestamp, purpose, "CONFIRMED"));
        totalDonated += msg.value;
        emit DonationReceived(donations.length - 1, msg.sender, msg.value, donorName, purpose, block.timestamp);
    }

    function getDonation(uint256 donationId) external view returns (DonationRecord memory) {
        require(donationId < donations.length, "Invalid donation");
        return donations[donationId];
    }

    function donationCount() external view returns (uint256) {
        return donations.length;
    }
}
