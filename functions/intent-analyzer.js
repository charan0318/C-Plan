
// This runs inside Chainlink Functions to analyze ElizaOS parsed intent feasibility
const intentJson = args[0]; // ElizaOS parsed intent as JSON string
const estimatedCost = args[1];
const userAddress = args[2];

let intent;
try {
  intent = JSON.parse(intentJson);
} catch (e) {
  return Functions.encodeString(JSON.stringify({
    feasible: false,
    error: "Invalid intent JSON format",
    confidence: 0
  }));
}

// Analyze ElizaOS parsed intent
const analysis = {
  feasible: true,
  confidence: 0.9, // Higher confidence with structured ElizaOS data
  recommendedGasPrice: "15",
  estimatedExecutionTime: "3-7 minutes",
  riskLevel: "low",
  alternatives: [],
  elizaParsed: true
};

// Task-specific analysis
switch (intent.task) {
  case "stake":
    analysis.alternatives.push("Consider liquid staking for better flexibility");
    if (intent.amount > 1000) {
      analysis.riskLevel = "medium";
      analysis.alternatives.push("Consider splitting into smaller stakes");
    }
    break;
    
  case "transfer":
    if (intent.frequency === "daily") {
      analysis.alternatives.push("Consider weekly transfers to save on gas");
    }
    break;
    
  case "swap":
    analysis.alternatives.push("Check DEX aggregators for best rates");
    if (intent.amount > 500) {
      analysis.riskLevel = "medium";
    }
    break;
    
  case "remind":
    analysis.estimatedExecutionTime = "Instant";
    analysis.riskLevel = "none";
    break;
}

// Token-specific checks
const riskTokens = ["CHZ", "MATIC"];
if (riskTokens.includes(intent.token)) {
  analysis.confidence = 0.75;
  analysis.alternatives.push("Consider more stable tokens like USDC/DAI");
}

// Condition-based adjustments
if (intent.condition) {
  if (intent.condition.type === "gas" && intent.condition.threshold < 10) {
    analysis.alternatives.push("Gas threshold too low, consider 15+ gwei");
  }
  if (intent.condition.type === "balance" && intent.condition.threshold > 10000) {
    analysis.riskLevel = "high";
    analysis.alternatives.push("High balance threshold may delay execution");
  }
}

// Cost analysis
if (parseInt(estimatedCost) > 100) {
  analysis.riskLevel = analysis.riskLevel === "low" ? "medium" : "high";
  analysis.alternatives.push("Consider batching with other transactions");
}

return Functions.encodeString(JSON.stringify(analysis));
