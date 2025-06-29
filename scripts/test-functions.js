
const hre = require("hardhat");
const fs = require("fs");
const { ethers } = hre;

async function main() {
  const contractAddress = "0xCA0d255BC0c66E3dDD974EA5E260E690d17c22aa"; // Updated with Sepolia deployment
  const subscriptionId = "5225"; // Update this with your subscription ID
  
  console.log("Testing Chainlink Functions integration...");

  // Get the contract instance
  const ChainlinkFunctionsConsumer = await ethers.getContractFactory("ChainlinkFunctionsConsumer");
  const functionsConsumer = ChainlinkFunctionsConsumer.attach(contractAddress);

  // Read the JavaScript source
  const source = fs.readFileSync("functions/intent-analyzer.js", "utf8");

  // Test with ElizaOS parsed intent
  const elizaParsedIntent = {
    task: "stake",
    token: "USDC",
    amount: 100,
    frequency: "weekly",
    condition: {
      type: "gas",
      threshold: 20,
      comparison: "<"
    }
  };
  
  const args = [
    JSON.stringify(elizaParsedIntent), // ElizaOS parsed intent
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
