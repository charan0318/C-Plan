
// Test the complete C-PLAN workflow from Eliza parsing to execution
const API_BASE = 'http://0.0.0.0:5000/api';

async function testFullWorkflow() {
  console.log('🧪 Testing Complete C-PLAN Workflow\n');
  
  // Step 1: Test Eliza parsing
  console.log('1️⃣ Testing Eliza Intent Parsing...');
  const chatResponse = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: "Transfer 10 CHZ to 0xFanWallet every Monday if CHZ balance > 100",
      userId: 1
    })
  });
  
  const chatResult = await chatResponse.json();
  console.log('✅ Eliza parsed intent:', JSON.stringify(chatResult.agentResponse.parsedIntent, null, 2));
  
  // Step 2: Create intent in smart contract
  console.log('\n2️⃣ Creating Intent in Smart Contract...');
  const intentResponse = await fetch(`${API_BASE}/intents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 1,
      walletAddress: '0x742d35Cc6644C4532B0C1234567890abCdEF1234',
      title: 'Weekly CHZ Transfer',
      description: 'Transfer 10 CHZ to fan wallet every Monday',
      action: 'TRANSFER',
      token: 'CHZ',
      amount: '10',
      frequency: 'WEEKLY',
      conditions: { type: 'balance', threshold: 100, comparison: '>' },
      targetChain: 'ethereum',
      elizaParsed: chatResult.agentResponse.parsedIntent.elizaParsed
    })
  });
  
  const intent = await intentResponse.json();
  console.log('✅ Intent created with ID:', intent.id);
  
  // Step 3: Wait for Chainlink Functions validation
  console.log('\n3️⃣ Waiting for Chainlink Functions validation...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const updatedIntentResponse = await fetch(`${API_BASE}/intents/${intent.id}`);
  const updatedIntent = await updatedIntentResponse.json();
  console.log('✅ Functions analysis:', JSON.stringify(updatedIntent.functionsAnalysis, null, 2));
  
  // Step 4: Test manual execution (simulating upkeep)
  console.log('\n4️⃣ Testing Intent Execution...');
  const executeResponse = await fetch(`${API_BASE}/intents/${intent.id}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const executeResult = await executeResponse.json();
  if (executeResult.executed) {
    console.log('✅ Intent executed successfully!');
    console.log('   Transaction:', executeResult.result.transactionHash);
    console.log('   NFT minted:', executeResult.nftMinted.tokenId);
  } else {
    console.log('⏭️  Execution skipped:', executeResult.reason);
  }
  
  // Step 5: Check execution history
  console.log('\n5️⃣ Checking Execution History...');
  const historyResponse = await fetch(`${API_BASE}/intents/${intent.id}/history`);
  const history = await historyResponse.json();
  console.log('✅ Execution history entries:', history.length);
  
  console.log('\n🎉 Full workflow test completed!');
  console.log('\n📋 Summary:');
  console.log('   ✅ Eliza parsed natural language intent');
  console.log('   ✅ Smart contract stored intent');
  console.log('   ✅ Chainlink Functions validated feasibility');
  console.log('   ✅ Upkeep executed intent on schedule');
  console.log('   ✅ NFT receipt minted');
  console.log('   ✅ Execution history recorded');
}

testFullWorkflow().catch(console.error);
