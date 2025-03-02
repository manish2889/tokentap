async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const token = await ethers.deployContract("TokenTap");
  await token.waitForDeployment();

  console.log("TokenTap deployed to:", await token.getAddress());
  
  // Fund the faucet with initial tokens
  const amount = ethers.parseEther("10000"); // Fund with 10,000 tokens
  await token.fundFaucet(amount);
  console.log("Funded faucet with 10,000 tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 