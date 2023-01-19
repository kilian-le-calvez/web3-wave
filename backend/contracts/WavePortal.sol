// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;

    event NewWave(address indexed from, string message, uint256 timestamp);

    struct Wave {
        address waver;
        string message;
        uint256 timestamp;
        uint256 won;
    }

    struct Balance {
        uint256 balance;
        uint256 contract_balance;
    }

    Wave[] waves;

    address payable owner;

    uint256 private seed;

    mapping(address => uint) public lastWavedAt;

    constructor() payable {
        console.log("Smart contract !");
        owner = payable(msg.sender);
        seed = (block.timestamp + block.difficulty) % 100;
    }

    function wave(string memory message) public payable {
        seed = (block.timestamp + block.difficulty) % 100;
        require(
            lastWavedAt[msg.sender] + 1 seconds < block.timestamp,
            "Wait 10sec"
        );
        lastWavedAt[msg.sender] = block.timestamp;
        totalWaves += 1;
        waves.push(Wave(msg.sender, message, block.timestamp, 0));
        emit NewWave(msg.sender, message, block.timestamp);
        uint256 giveAway = 0.001 ether;
        if (giveAway > address(this).balance) {
            require(giveAway <= address(this).balance, "Not enough money");
        }
        if (seed < 50) {
            (bool success, ) = owner.call{value: giveAway}("");
            waves[waves.length - 1].won = giveAway;
            require(success, "Failed to send money");
        }
    }

    function getBalance() public view returns (Balance memory) {
        Balance memory balance;
        balance.contract_balance = address(this).balance;
        balance.balance = msg.sender.balance;
        return balance;
    }

    function getWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        // console.log(totalWaves);
        return totalWaves;
    }

    function canSpam() public view returns (bool) {
        return (lastWavedAt[msg.sender] + 10 seconds < block.timestamp);
    }
}
