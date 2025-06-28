// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@thirdweb-dev/contracts/base/ERC721Base.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract WalletPlanner is ERC721Base, AutomationCompatible {
    struct Intent {
        address user;
        string description;
        uint256 estimatedCost;
        uint256 timestamp;
        uint256 executionTime;
        bool executed;
        bool isScheduled;
    }

    uint256 private _nextIntentId;
    mapping(uint256 => Intent) public intents;
    mapping(address => uint256[]) public userIntents;

    uint256 public constant INTERVAL = 1 hours;
    uint256 public lastChecked;
    address public functionsConsumer;

    event IntentCreated(uint256 indexed intentId, address indexed user, string description);
    event IntentExecuted(uint256 indexed intentId, address indexed user);
    event AutomationPerformed(uint256 timestamp, uint256 intentsProcessed);

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
            user: msg.sender,
            description: _description,
            estimatedCost: _estimatedCost,
            timestamp: block.timestamp,
            executionTime: 0,
            executed: false,
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
        require(_executionTime > block.timestamp, "Invalid execution time");

        uint256 intentId = _nextIntentId++;

        intents[intentId] = Intent({
            user: msg.sender,
            description: _description,
            estimatedCost: _estimatedCost,
            timestamp: block.timestamp,
            executionTime: _executionTime,
            executed: false,
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
        _mint(msg.sender, 1);
        emit IntentExecuted(_intentId, msg.sender);
    }

    function getUserIntents(address _user) external view returns (uint256[] memory) {
        return userIntents[_user];
    }

    function getIntent(uint256 _intentId) external view returns (Intent memory) {
        return intents[_intentId];
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        bool timeElapsed = (block.timestamp - lastChecked) > INTERVAL;
        uint256 readyCount = 0;

        for (uint256 i = 0; i < _nextIntentId && readyCount < 5; i++) {
            Intent storage intent = intents[i];
            if (intent.isScheduled && !intent.executed && block.timestamp >= intent.executionTime) {
                readyCount++;
            }
        }

        upkeepNeeded = timeElapsed && readyCount > 0;
        performData = abi.encode(readyCount);
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256 readyCount = abi.decode(performData, (uint256));
        lastChecked = block.timestamp;
        uint256 processed = 0;

        for (uint256 i = 0; i < _nextIntentId && processed < readyCount; i++) {
            Intent storage intent = intents[i];
            if (intent.isScheduled && !intent.executed && block.timestamp >= intent.executionTime) {
                intent.executed = true;
                processed++;
                _mint(intent.user, 1);
                emit IntentExecuted(i, intent.user);
            }
        }

        emit AutomationPerformed(block.timestamp, processed);
    }

    function setFunctionsConsumer(address _functionsConsumer) external onlyOwner {
        functionsConsumer = _functionsConsumer;
    }

    function _canMint() internal view virtual override returns (bool) {
        return true;
    }
}