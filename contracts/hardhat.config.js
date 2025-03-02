require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    holesky: {
      url: "https://ethereum-holesky.publicnode.com",
      accounts: [PRIVATE_KEY],
      chainId: 17000
    }
  }
}; 