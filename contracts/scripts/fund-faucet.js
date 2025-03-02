async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Funding faucet with account:", deployer.address);

  const contractAddress = "0x6bFEF8ac708ef73142Fb59D29590351D0C07920a";
  const token = await ethers.getContractAt("TokenTap", contractAddress);

  // Check current balances
  const contractBalance = await token.balanceOf(contractAddress);
  const deployerBalance = await token.balanceOf(deployer.address);
  
  console.log("Current balances:");
  console.log("Contract:", ethers.formatEther(contractBalance), "TAP");
  console.log("Deployer:", ethers.formatEther(deployerBalance), "TAP");

  if (deployerBalance === 0n) {
    console.log("Deployer has no tokens to fund the faucet!");
    return;
  }

  // Fund the faucet with tokens
  const fundAmount = ethers.parseEther("10000"); // Fund with 10,000 tokens
  console.log("\nFunding faucet with", ethers.formatEther(fundAmount), "TAP tokens...");
  
  const tx = await token.fundFaucet(fundAmount);
  await tx.wait();
  
  // Check new balances
  const newContractBalance = await token.balanceOf(contractAddress);
  const newDeployerBalance = await token.balanceOf(deployer.address);
  
  console.log("\nNew balances:");
  console.log("Contract:", ethers.formatEther(newContractBalance), "TAP");
  console.log("Deployer:", ethers.formatEther(newDeployerBalance), "TAP");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 