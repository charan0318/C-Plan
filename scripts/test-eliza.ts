
import { elizaService } from '../server/elizaService.js';

async function testElizaIntegration() {
  console.log("🧠 Testing ElizaOS Integration for C-Plan\n");
  
  const testCases = [
    "Stake 100 USDC weekly when gas < 20 gwei",
    "Send 10 CHZ every Monday to 0xFanWallet if CHZ balance is above 100",
    "Swap 0.5 ETH to USDC when ETH price is above $3000",
    "Remind me to check portfolio when DAI balance drops below 50",
    "Transfer 25 MATIC monthly to my savings wallet"
  ];
  
  for (const testCase of testCases) {
    console.log(`📝 Input: "${testCase}"`);
    
    try {
      const parsed = await elizaService.parseIntent(testCase);
      const isValid = parsed ? await elizaService.validateIntent(parsed) : false;
      
      console.log(`✅ Parsed Intent:`, JSON.stringify(parsed, null, 2));
      console.log(`🔍 Valid: ${isValid ? 'Yes' : 'No'}`);
      console.log('─'.repeat(50));
    } catch (error) {
      console.error(`❌ Error:`, error.message);
      console.log('─'.repeat(50));
    }
  }
  
  console.log("\n🎉 ElizaOS integration test complete!");
}

testElizaIntegration().catch(console.error);
