require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({path: ".env"});

const privateKey = process.env.RINKEBY_PRIVATE_KEY;
const apiKey = process.env.ALCHEMY_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    rinkeby: {
      url: apiKey,
      accounts: [privateKey]
    }
  }
};
