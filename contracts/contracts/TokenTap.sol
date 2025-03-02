// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenTap is ERC20, Ownable {
    mapping(address => uint256) public lastRequestTime;
    uint256 public constant REQUEST_COOLDOWN = 1 hours;
    uint256 public constant TOKENS_PER_REQUEST = 100 * 10**18; // 100 tokens

    constructor() ERC20("TokenTap", "TAP") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**18); // Mint 1 million tokens initially
    }

    function mint(uint256 amount) public onlyOwner {
        _mint(msg.sender, amount);
    }

    function mintAndFundFaucet(uint256 amount) public onlyOwner {
        _mint(address(this), amount);
    }

    function requestTokens() public {
        require(block.timestamp >= lastRequestTime[msg.sender] + REQUEST_COOLDOWN, "Tokens already requested");
        require(balanceOf(address(this)) >= TOKENS_PER_REQUEST, "Insufficient tokens in faucet");

        lastRequestTime[msg.sender] = block.timestamp;
        _transfer(address(this), msg.sender, TOKENS_PER_REQUEST);
    }

    function getBalance(address user) public view returns (uint256) {
        return balanceOf(user);
    }

    function fundFaucet(uint256 amount) public {
        _transfer(msg.sender, address(this), amount);
    }
} 