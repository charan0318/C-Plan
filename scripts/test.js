
const { execSync } = require('child_process');

try {
  console.log('🧪 Running WalletPlanner contract tests...\n');
  
  // Run Hardhat tests
  execSync('npx hardhat test', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ All tests passed successfully!');
} catch (error) {
  console.error('\n❌ Tests failed:', error.message);
  process.exit(1);
}
