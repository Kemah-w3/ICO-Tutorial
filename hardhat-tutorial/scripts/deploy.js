const { ethers } = require("hardhat");
require("dotenv").config({path: ".env"});
const { CRYPTODEVS_CONTRACT_ADDRESS } = require("../constants");

async function main() {
  const cryptoDevsContract = await ethers.getContractFactory("CryptoDevToken");
  const deployCryptoDevsContract = await cryptoDevsContract.deploy(
    CRYPTODEVS_CONTRACT_ADDRESS
  );

  await deployCryptoDevsContract.deployed();

  console.log(
    `CryptoDevs contract was deployed succesfully: ${deployCryptoDevsContract.address}`
  )

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })