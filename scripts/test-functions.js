
import hre from "hardhat";
import fs from "fs";
const { ethers } = hre;

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Updated with local deployment
  const subscriptionId = "5225"; // Update this with your subscription ID
  
  console.log("Testing Chainlink Functions integration...");

  // Get the contract instance
  const ChainlinkFunctionsConsumer = await ethers.getContractFactory("ChainlinkFunctionsConsumer");
  const functionsConsumer = ChainlinkFunctionsConsumer.attach(contractAddress);

  // Read the JavaScript source
  const source = fs.readFileSync("functions/intent-analyzer.js", "utf8");

  // Test parameters
  const args = [
    "Stake 100 USDC weekly when gas < 20 gwei",
    "50", // estimated cost in USD
    "0x742d35Cc6644C4532B0C1234567890abCdEF1234" // example user address
  ];

  try {
    console.log("Sending request to Chainlink Functions...");
    
    const tx = await functionsConsumer.sendRequest(
      source,
      "0x", // no encrypted secrets
      0, // no DON hosted secrets
      0, // no DON hosted secrets version
      args,
      [], // no bytes args
      subscriptionId,
      300000 // callback gas limit
    );

    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    
    console.log("Request sent successfully! Monitor the contract for the response.");
    console.log("Check s_lastResponse() on the contract for results.");
    
  } catch (error) {
    console.error("Error sending request:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
