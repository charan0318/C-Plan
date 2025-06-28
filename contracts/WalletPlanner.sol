
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract WalletPlanner {
    struct Intent {
        uint256 id;
        address owner;
        string title;
        string description;
        string action;
        string token;
        uint256 amount;
        string frequency;
        string targetChain;
        bool isActive;
        uint256 nextExecution;
        uint256 createdAt;
    }

    uint256 private _intentCounter;
    mapping(uint256 => Intent) public intents;
    mapping(address => uint256[]) public userIntents;

    event IntentCreated(
        uint256 indexed intentId,
        address indexed owner,
        string title,
        string action
    );

    event IntentExecuted(
        uint256 indexed intentId,
        address indexed owner,
        bool success
    );

    constructor() {
        _intentCounter = 0;
    }

    function createIntent(
        string memory _title,
        string memory _description,
        string memory _action,
        string memory _token,
        uint256 _amount,
        string memory _frequency,
        string memory _targetChain,
        uint256 _nextExecution
    ) external returns (uint256) {
        _intentCounter++;
        uint256 intentId = _intentCounter;

        intents[intentId] = Intent({
            id: intentId,
            owner: msg.sender,
            title: _title,
            description: _description,
            action: _action,
            token: _token,
            amount: _amount,
            frequency: _frequency,
            targetChain: _targetChain,
            isActive: true,
            nextExecution: _nextExecution,
            createdAt: block.timestamp
        });

        userIntents[msg.sender].push(intentId);

        emit IntentCreated(intentId, msg.sender, _title, _action);
        return intentId;
    }

    function getIntent(uint256 _intentId) external view returns (Intent memory) {
        return intents[_intentId];
    }

    function getUserIntents(address _user) external view returns (uint256[] memory) {
        return userIntents[_user];
    }

    function toggleIntentStatus(uint256 _intentId) external {
        require(intents[_intentId].owner == msg.sender, "Not intent owner");
        intents[_intentId].isActive = !intents[_intentId].isActive;
    }

    function executeIntent(uint256 _intentId) external {
        require(intents[_intentId].isActive, "Intent not active");
        require(block.timestamp >= intents[_intentId].nextExecution, "Not ready for execution");

        // Intent execution logic would go here
        // For now, we'll just emit an event

        emit IntentExecuted(_intentId, intents[_intentId].owner, true);
    }
}
