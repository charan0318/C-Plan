
// Simulate Chainlink Automation performing upkeep checks
const UPKEEP_INTERVAL = 30000; // 30 seconds
const API_BASE = 'http://0.0.0.0:5000/api';

async function checkAndExecuteIntents() {
  try {
    console.log('🔄 Chainlink Automation: Checking for executable intents...');
    
    const response = await fetch(`${API_BASE}/intents`);
    const intents = await response.json();
    
    const activeIntents = intents.filter(intent => 
      intent.isActive && 
      intent.status === 'active' &&
      (!intent.nextExecution || new Date(intent.nextExecution) <= new Date())
    );
    
    console.log(`Found ${activeIntents.length} potentially executable intents`);
    
    for (const intent of activeIntents) {
      console.log(`⚡ Attempting to execute intent #${intent.id}: ${intent.title}`);
      
      const executeResponse = await fetch(`${API_BASE}/intents/${intent.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await executeResponse.json();
      
      if (result.executed) {
        console.log(`✅ Intent #${intent.id} executed successfully! NFT #${result.nftMinted.tokenId} minted.`);
        console.log(`   Transaction: ${result.result.transactionHash}`);
        console.log(`   Gas used: ${result.result.gasUsed}`);
      } else {
        console.log(`⏭️  Intent #${intent.id} skipped: ${result.reason}`);
      }
    }
    
    if (activeIntents.length === 0) {
      console.log('💤 No intents ready for execution');
    }
    
  } catch (error) {
    console.error('❌ Automation error:', error.message);
  }
}

// Start the automation loop
console.log('🚀 Starting C-PLAN Automation Simulator...');
console.log(`📅 Checking for executable intents every ${UPKEEP_INTERVAL/1000} seconds`);

// Initial check
checkAndExecuteIntents();

// Set up recurring checks
setInterval(checkAndExecuteIntents, UPKEEP_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping automation simulator...');
  process.exit(0);
});
