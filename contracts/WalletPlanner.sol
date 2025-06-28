
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@thirdweb-dev/contracts/base/ERC721Base.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract WalletPlanner is ERC721Base, AutomationCompatible {
    struct Intent {
        uint256 id;
        address user;
        string description;
        uint256 estimatedCost;
        bool executed;
        uint256 timestamp;
        uint256 executionTime; // When to execute this intent
        bool isScheduled; // Whether this intent is scheduled for execution
    }
    
    uint256 private _nextIntentId;
    mapping(uint256 => Intent) public intents;
    mapping(address => uint256[]) public userIntents;
    
    // Automation variables
    uint256 public interval = 1 hours; // Check every hour
    uint256 public lastChecked;
    address public functionsConsumer; // Address of ChainlinkFunctionsConsumer contract
    
    event IntentCreated(uint256 indexed intentId, address indexed user, string description);
    event IntentExecuted(uint256 indexed intentId, address indexed user);
    event AutomationPerformed(uint256 timestamp, uint256 intentsProcessed);
    event FunctionsConsumerUpdated(address indexed oldConsumer, address indexed newConsumer);
    
    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps
    )
        ERC721Base(
            _defaultAdmin,
            _name,
            _symbol,
            _royaltyRecipient,
            _royaltyBps
        )
    {}
    
    function createIntent(
        string memory _description,
        uint256 _estimatedCost
    ) external returns (uint256) {
        uint256 intentId = _nextIntentId++;
        
        intents[intentId] = Intent({
            id: intentId,
            user: msg.sender,
            description: _description,
            estimatedCost: _estimatedCost,
            executed: false,
            timestamp: block.timestamp,
            executionTime: 0,
            isScheduled: false
        });
        
        userIntents[msg.sender].push(intentId);
        
        emit IntentCreated(intentId, msg.sender, _description);
        return intentId;
    }
    
    function createScheduledIntent(
        string memory _description,
        uint256 _estimatedCost,
        uint256 _executionTime
    ) external returns (uint256) {
        require(_executionTime > block.timestamp, "Execution time must be in the future");
        
        uint256 intentId = _nextIntentId++;
        
        intents[intentId] = Intent({
            id: intentId,
            user: msg.sender,
            description: _description,
            estimatedCost: _estimatedCost,
            executed: false,
            timestamp: block.timestamp,
            executionTime: _executionTime,
            isScheduled: true
        });
        
        userIntents[msg.sender].push(intentId);
        
        emit IntentCreated(intentId, msg.sender, _description);
        return intentId;
    }
    
    function executeIntent(uint256 _intentId) external {
        Intent storage intent = intents[_intentId];
        require(intent.user == msg.sender, "Not authorized");
        require(!intent.executed, "Already executed");
        
        intent.executed = true;
        
        // Mint NFT as proof of execution - mint 1 NFT with empty URI
        _mint(msg.sender, 1);
        
        emit IntentExecuted(_intentId, msg.sender);
    }
    
    function getUserIntents(address _user) external view returns (uint256[] memory) {
        return userIntents[_user];
    }
    
    function getIntent(uint256 _intentId) external view returns (Intent memory) {
        return intents[_intentId];
    }
    
    // Chainlink Automation implementation
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        // Check if enough time has passed since last check
        bool timeElapsed = (block.timestamp - lastChecked) > interval;
        
        // Check if there are any scheduled intents ready for execution
        uint256 readyIntents = 0;
        uint256[] memory readyIntentIds = new uint256[](100); // Max 100 intents per batch
        
        for (uint256 i = 0; i < _nextIntentId && readyIntents < 100; i++) {
            Intent storage intent = intents[i];
            if (intent.isScheduled && 
                !intent.executed && 
                block.timestamp >= intent.executionTime) {
                readyIntentIds[readyIntents] = i;
                readyIntents++;
            }
        }
        
        upkeepNeeded = timeElapsed && readyIntents > 0;
        performData = abi.encode(readyIntentIds, readyIntents);
    }
    
    function performUpkeep(bytes calldata performData) external override {
        (uint256[] memory readyIntentIds, uint256 readyIntents) = abi.decode(performData, (uint256[], uint256));
        
        lastChecked = block.timestamp;
        uint256 processed = 0;
        
        // Process ready intents
        for (uint256 i = 0; i < readyIntents; i++) {
            uint256 intentId = readyIntentIds[i];
            Intent storage intent = intents[intentId];
            
            // Double-check the intent is still valid and ready
            if (intent.isScheduled && 
                !intent.executed && 
                block.timestamp >= intent.executionTime) {
                
                // Execute the intent
                intent.executed = true;
                processed++;
                
                // Mint NFT as proof of execution
                _mint(intent.user, 1);
                
                emit IntentExecuted(intentId, intent.user);
                
                // If we have a functions consumer, trigger validation
                if (functionsConsumer != address(0)) {
                    requestTaskValidation(intentId);
                }
            }
        }
        
        emit AutomationPerformed(block.timestamp, processed);
    }
    
    function requestTaskValidation(uint256 _intentId) internal {
        // This would call the ChainlinkFunctionsConsumer contract
        // For now, we just emit an event - integration would require interface
        // In a full implementation, you would call the functions consumer here
    }
    
    // Admin functions
    function setAutomationInterval(uint256 _interval) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        interval = _interval;
    }
    
    function setFunctionsConsumer(address _functionsConsumer) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        address oldConsumer = functionsConsumer;
        functionsConsumer = _functionsConsumer;
        emit FunctionsConsumerUpdated(oldConsumer, _functionsConsumer);
    }
    
    // View functions
    function getScheduledIntents() external view returns (uint256[] memory) {
        uint256 scheduledCount = 0;
        
        // First pass: count scheduled intents
        for (uint256 i = 0; i < _nextIntentId; i++) {
            if (intents[i].isScheduled && !intents[i].executed) {
                scheduledCount++;
            }
        }
        
        // Second pass: collect scheduled intent IDs
        uint256[] memory scheduledIntents = new uint256[](scheduledCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _nextIntentId; i++) {
            if (intents[i].isScheduled && !intents[i].executed) {
                scheduledIntents[index] = i;
                index++;
            }
        }
        
        return scheduledIntents;
    }
    
    function getReadyIntents() external view returns (uint256[] memory) {
        uint256 readyCount = 0;
        
        // First pass: count ready intents
        for (uint256 i = 0; i < _nextIntentId; i++) {
            Intent storage intent = intents[i];
            if (intent.isScheduled && 
                !intent.executed && 
                block.timestamp >= intent.executionTime) {
                readyCount++;
            }
        }
        
        // Second pass: collect ready intent IDs
        uint256[] memory readyIntents = new uint256[](readyCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _nextIntentId; i++) {
            Intent storage intent = intents[i];
            if (intent.isScheduled && 
                !intent.executed && 
                block.timestamp >= intent.executionTime) {
                readyIntents[index] = i;
                index++;
            }
        }
        
        return readyIntents;
    }
    
    // Override to allow anyone to mint through intent execution
    function _canMint() internal view virtual override returns (bool) {
        return true;
    }
}
