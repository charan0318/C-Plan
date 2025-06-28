
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title WalletPlanner
 * @dev Multi-Agent Wallet Planner smart contract for C-PLAN system
 * @notice This contract allows users to save wallet intents that can be executed
 * by Chainlink Automation based on specified conditions evaluated by Chainlink Functions
 * 
 * Integration with Chainlink:
 * - Chainlink Functions: Used for off-chain condition evaluation and data fetching
 * - Chainlink Automation: Used for periodic execution of intents when conditions are met
 * 
 * Example Intent Structure:
 * {
 *   user: 0x123...,
 *   action: "stake",
 *   token: 0xA0b86a33E6441e94eE9A1B6A4E7DF07d7c71D4bC,
 *   frequency: "daily",
 *   condition: "gas < 30 gwei && balance > 100 USDC",
 *   lastExecuted: 1234567890,
 *   targetChain: "ethereum",
 *   paused: false,
 *   exists: true
 * }
 */
contract WalletPlanner is Ownable, ReentrancyGuard, Pausable {
    
    /// @dev Contract version for future upgrades and compatibility
    string public constant VERSION = "1.0.0";
    
    /// @dev Maximum number of intents per user to prevent gas issues
    uint256 public constant MAX_INTENTS_PER_USER = 50;
    
    /// @dev Struct representing a wallet intent
    struct WalletIntent {
        address user;           // Owner of the intent
        string action;          // Action type: "stake", "send", "remind", "monitor", etc.
        address token;          // ERC20 token address (use address(0) for native token)
        string frequency;       // Execution frequency: "daily", "weekly", "monthly", "once"
        string condition;       // Condition string for off-chain evaluation
        uint256 lastExecuted;   // Timestamp of last execution
        string targetChain;     // Target blockchain: "ethereum", "polygon", "bsc", etc.
        bool paused;           // Whether the intent is paused
        bool exists;           // Whether the intent exists (for soft deletion)
    }
    
    /// @dev Mapping from user address to their array of intents
    mapping(address => WalletIntent[]) public userIntents;
    
    /// @dev Mapping to track total intent count per user
    mapping(address => uint256) public userIntentCount;
    
    /// @dev Mapping from intent hash to user address for quick lookups
    mapping(bytes32 => address) public intentOwners;
    
    /// @dev Authorized Chainlink Automation addresses
    mapping(address => bool) public authorizedExecutors;
    
    /// @dev Event emitted when a new intent is saved
    event IntentSaved(
        address indexed user,
        uint256 indexed intentIndex,
        string action,
        address token,
        string frequency
    );
    
    /// @dev Event emitted when an intent is executed
    event IntentExecuted(
        address indexed user,
        uint256 indexed intentIndex,
        bool success,
        string reason
    );
    
    /// @dev Event emitted when an intent is paused/unpaused
    event IntentStatusChanged(
        address indexed user,
        uint256 indexed intentIndex,
        bool paused
    );
    
    /// @dev Event emitted when an intent is deleted
    event IntentDeleted(
        address indexed user,
        uint256 indexed intentIndex
    );
    
    /// @dev Event emitted when an executor is authorized/deauthorized
    event ExecutorStatusChanged(
        address indexed executor,
        bool authorized
    );
    
    /// @dev Constructor initializes the contract and sets the deployer as owner
    constructor() Ownable(msg.sender) {
        // Contract is ready to accept intents
    }
    
    /// @dev Modifier to check if caller is authorized executor
    modifier onlyAuthorizedExecutor() {
        require(
            authorizedExecutors[msg.sender] || msg.sender == owner(),
            "Not authorized executor"
        );
        _;
    }
    
    /// @dev Modifier to check intent ownership
    modifier onlyIntentOwner(uint256 intentIndex) {
        require(intentIndex < userIntents[msg.sender].length, "Intent does not exist");
        require(userIntents[msg.sender][intentIndex].user == msg.sender, "Not intent owner");
        require(userIntents[msg.sender][intentIndex].exists, "Intent deleted");
        _;
    }
    
    /**
     * @dev Save a new wallet intent from ElizaOS agent parsing
     * @param action The action type (stake, send, remind, etc.)
     * @param token The token address (address(0) for native token)
     * @param frequency Execution frequency
     * @param condition Condition string for Chainlink Functions evaluation
     * @param targetChain Target blockchain identifier
     */
    function saveIntent(
        string calldata action,
        address token,
        string calldata frequency,
        string calldata condition,
        string calldata targetChain
    ) external whenNotPaused returns (uint256) {
        require(bytes(action).length > 0, "Action cannot be empty");
        require(bytes(frequency).length > 0, "Frequency cannot be empty");
        require(userIntentCount[msg.sender] < MAX_INTENTS_PER_USER, "Max intents reached");
        
        WalletIntent memory newIntent = WalletIntent({
            user: msg.sender,
            action: action,
            token: token,
            frequency: frequency,
            condition: condition,
            lastExecuted: 0,
            targetChain: targetChain,
            paused: false,
            exists: true
        });
        
        userIntents[msg.sender].push(newIntent);
        uint256 intentIndex = userIntents[msg.sender].length - 1;
        userIntentCount[msg.sender]++;
        
        // Create intent hash for quick lookups
        bytes32 intentHash = keccak256(
            abi.encodePacked(msg.sender, intentIndex, action, token, frequency)
        );
        intentOwners[intentHash] = msg.sender;
        
        emit IntentSaved(msg.sender, intentIndex, action, token, frequency);
        return intentIndex;
    }
    
    /**
     * @dev Get all intents for a user with pagination
     * @param user The user address
     * @param offset Starting index
     * @param limit Maximum number of intents to return
     */
    function getUserIntents(
        address user,
        uint256 offset,
        uint256 limit
    ) external view returns (WalletIntent[] memory intents, uint256 total) {
        total = userIntents[user].length;
        
        if (offset >= total) {
            return (new WalletIntent[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 length = end - offset;
        intents = new WalletIntent[](length);
        
        for (uint256 i = 0; i < length; i++) {
            intents[i] = userIntents[user][offset + i];
        }
        
        return (intents, total);
    }
    
    /**
     * @dev Get a specific intent by user and index
     * @param user The user address
     * @param intentIndex The intent index
     */
    function getIntent(
        address user,
        uint256 intentIndex
    ) external view returns (WalletIntent memory) {
        require(intentIndex < userIntents[user].length, "Intent does not exist");
        return userIntents[user][intentIndex];
    }
    
    /**
     * @dev Pause or unpause a specific intent
     * @param intentIndex The intent index to pause/unpause
     */
    function toggleIntentPause(uint256 intentIndex) 
        external 
        onlyIntentOwner(intentIndex) 
    {
        userIntents[msg.sender][intentIndex].paused = 
            !userIntents[msg.sender][intentIndex].paused;
        
        emit IntentStatusChanged(
            msg.sender,
            intentIndex,
            userIntents[msg.sender][intentIndex].paused
        );
    }
    
    /**
     * @dev Delete an intent (soft delete)
     * @param intentIndex The intent index to delete
     */
    function deleteIntent(uint256 intentIndex) 
        external 
        onlyIntentOwner(intentIndex) 
    {
        userIntents[msg.sender][intentIndex].exists = false;
        userIntentCount[msg.sender]--;
        
        emit IntentDeleted(msg.sender, intentIndex);
    }
    
    /**
     * @dev Execute an intent (called by Chainlink Automation)
     * @param user The user whose intent to execute
     * @param intentIndex The intent index
     * @param success Whether the execution was successful
     * @param reason Reason for success/failure
     */
    function executeIntent(
        address user,
        uint256 intentIndex,
        bool success,
        string calldata reason
    ) external onlyAuthorizedExecutor nonReentrant {
        require(intentIndex < userIntents[user].length, "Intent does not exist");
        require(userIntents[user][intentIndex].exists, "Intent deleted");
        require(!userIntents[user][intentIndex].paused, "Intent paused");
        
        // Update last executed timestamp
        userIntents[user][intentIndex].lastExecuted = block.timestamp;
        
        emit IntentExecuted(user, intentIndex, success, reason);
    }
    
    /**
     * @dev Check if conditions are met for intent execution
     * @param user The user address
     * @param intentIndex The intent index
     * @return ready Whether the intent is ready for execution
     * @return reason Reason why it's ready or not ready
     */
    function checkIntentConditions(
        address user,
        uint256 intentIndex
    ) external view returns (bool ready, string memory reason) {
        if (intentIndex >= userIntents[user].length) {
            return (false, "Intent does not exist");
        }
        
        WalletIntent memory intent = userIntents[user][intentIndex];
        
        if (!intent.exists) {
            return (false, "Intent deleted");
        }
        
        if (intent.paused) {
            return (false, "Intent paused");
        }
        
        // This would integrate with Chainlink Functions for real condition checking
        // For now, return basic time-based check
        if (intent.lastExecuted == 0) {
            return (true, "Ready for first execution");
        }
        
        // Simple frequency check (in production, this would be more sophisticated)
        uint256 timeSinceLastExecution = block.timestamp - intent.lastExecuted;
        
        if (keccak256(bytes(intent.frequency)) == keccak256("daily")) {
            return (timeSinceLastExecution >= 1 days, "Daily frequency check");
        } else if (keccak256(bytes(intent.frequency)) == keccak256("weekly")) {
            return (timeSinceLastExecution >= 7 days, "Weekly frequency check");
        } else if (keccak256(bytes(intent.frequency)) == keccak256("monthly")) {
            return (timeSinceLastExecution >= 30 days, "Monthly frequency check");
        } else if (keccak256(bytes(intent.frequency)) == keccak256("once")) {
            return (intent.lastExecuted == 0, "One-time execution check");
        }
        
        return (false, "Unknown frequency");
    }
    
    /**
     * @dev Authorize or deauthorize Chainlink Automation addresses
     * @param executor The executor address
     * @param authorized Whether to authorize or deauthorize
     */
    function setExecutorStatus(
        address executor,
        bool authorized
    ) external onlyOwner {
        authorizedExecutors[executor] = authorized;
        emit ExecutorStatusChanged(executor, authorized);
    }
    
    /**
     * @dev Emergency pause all intent executions
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Resume intent executions
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get user intent count
     * @param user The user address
     */
    function getUserIntentCount(address user) external view returns (uint256) {
        return userIntentCount[user];
    }
    
    /**
     * @dev Check if an executor is authorized
     * @param executor The executor address
     */
    function isAuthorizedExecutor(address executor) external view returns (bool) {
        return authorizedExecutors[executor] || executor == owner();
    }
}
