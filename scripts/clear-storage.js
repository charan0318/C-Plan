
const fs = require('fs');
const path = require('path');

async function clearStorage() {
  console.log("🧹 Clearing all stored data...");
  
  try {
    // Clear the file storage
    const filePath = path.join(process.cwd(), '.storage.json');
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("✓ Deleted .storage.json file");
    } else {
      console.log("ℹ No .storage.json file found");
    }
    
    // Clear global storage if running
    if (global.storageData) {
      global.storageData = null;
      console.log("✓ Cleared global storage");
    }
    
    console.log("\n🎉 All storage cleared successfully!");
    console.log("- All intents removed");
    console.log("- All NFT tokens removed");
    console.log("- All execution history removed");
    console.log("- All chat messages removed");
    console.log("- All user data removed");
    console.log("\nRestart the server to see the changes take effect.");
    
  } catch (error) {
    console.error("❌ Error clearing storage:", error);
  }
}

clearStorage();
