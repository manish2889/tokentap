async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Minting and funding faucet with account:", deployer.address);

  const contractAddress = "0x6bFEF8ac708ef73142Fb59D29590351D0C07920a";
  const token = await ethers.getContractAt("TokenTap", contractAddress);

  // Check current balances
  const contractBalance = await token.balanceOf(contractAddress);
  console.log("\nCurrent contract balance:", ethers.formatEther(contractBalance), "TAP");

  // Mint tokens directly to the contract
  const mintAmount = ethers.parseEther("100000"); // Mint 100,000 tokens
  console.log("\nMinting and funding contract with", ethers.formatEther(mintAmount), "TAP tokens...");
  
  const tx = await token.mintAndFundFaucet(mintAmount);
  await tx.wait();
  
  // Check new balance
  const newContractBalance = await token.balanceOf(contractAddress);
  console.log("\nNew contract balance:", ethers.formatEther(newContractBalance), "TAP");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 