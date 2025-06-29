
import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const contractAddress = "0x5df2E434371136108d73EF1153d5CDFA13d01d52";
  
  console.log("Checking Chainlink Functions response...");

  // Get the contract instance
  const ChainlinkFunctionsConsumer = await ethers.getContractFactory("ChainlinkFunctionsConsumer");
  const functionsConsumer = ChainlinkFunctionsConsumer.attach(contractAddress);

  try {
    // Check the last request ID
    const lastRequestId = await functionsConsumer.s_lastRequestId();
    console.log("Last Request ID:", lastRequestId);
    
    // Check the response
    const lastResponse = await functionsConsumer.s_lastResponse();
    console.log("Raw Response:", lastResponse);
    
    // Check for errors
    const lastError = await functionsConsumer.s_lastError();
    console.log("Last Error:", lastError);
    
    // Try to decode the response if it exists
    if (lastResponse && lastResponse !== "0x") {
      try {
        const decodedResponse = ethers.toUtf8String(lastResponse);
        console.log("Decoded Response:", decodedResponse);
        
        // Try to parse as JSON
        const parsedResponse = JSON.parse(decodedResponse);
        console.log("Parsed Response:", JSON.stringify(parsedResponse, null, 2));
      } catch (decodeError) {
        console.log("Could not decode response as UTF-8 string or JSON");
      }
    } else {
      console.log("No response received yet. The request may still be processing.");
    }
    
  } catch (error) {
    console.error("Error checking response:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
