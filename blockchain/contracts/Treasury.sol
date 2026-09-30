// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./AccessControl.sol";

contract Treasury is BlockTrustAccessControl {
    struct ExpenseRecord {
        address requestedBy;
        address payable recipient;
        uint256 amount;
        uint256 timestamp;
        string category;
        string description;
        string proofURI;
        bool paid;
    }

    ExpenseRecord[] private expenses;
    uint256 public totalSpent;

    event FundsTransferred(address indexed recipient, uint256 amount, string category);
    event ExpenseAdded(uint256 indexed expenseId, address indexed requestedBy, uint256 amount, string category, string proofURI);

    receive() external payable {}

    function addExpense(
        address payable recipient,
        uint256 amount,
        string calldata category,
        string calldata description,
        string calldata proofURI,
        bool payNow
    ) external onlyAdmin {
        require(amount > 0, "Amount must be positive");
        require(amount <= address(this).balance, "Insufficient treasury balance");

        expenses.push(ExpenseRecord(msg.sender, recipient, amount, block.timestamp, category, description, proofURI, payNow));
        emit ExpenseAdded(expenses.length - 1, msg.sender, amount, category, proofURI);

        if (payNow) {
            totalSpent += amount;
            recipient.transfer(amount);
            emit FundsTransferred(recipient, amount, category);
        }
    }

    function expenseCount() external view returns (uint256) {
        return expenses.length;
    }

    function getExpense(uint256 expenseId) external view returns (ExpenseRecord memory) {
        require(expenseId < expenses.length, "Invalid expense");
        return expenses[expenseId];
    }
}
