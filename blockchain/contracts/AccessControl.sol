// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BlockTrustAccessControl {
    address public owner;
    mapping(address => bool) public admins;
    mapping(address => bool) public auditors;

    event AdminUpdated(address indexed account, bool enabled);
    event AuditorUpdated(address indexed account, bool enabled);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == owner || admins[msg.sender], "Only admin");
        _;
    }

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }

    function setAdmin(address account, bool enabled) external onlyOwner {
        admins[account] = enabled;
        emit AdminUpdated(account, enabled);
    }

    function setAuditor(address account, bool enabled) external onlyOwner {
        auditors[account] = enabled;
        emit AuditorUpdated(account, enabled);
    }
}
