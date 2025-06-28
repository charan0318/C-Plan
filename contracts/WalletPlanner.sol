
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@thirdweb-dev/contracts/base/ERC721Base.sol";

contract WalletPlanner is ERC721Base {
    struct Intent {
        uint256 id;
        address user;
        string description;
        uint256 estimatedCost;
        bool executed;
        uint256 timestamp;
    }
    
    uint256 private _nextIntentId;
    mapping(uint256 => Intent) public intents;
    mapping(address => uint256[]) public userIntents;
    
    event IntentCreated(uint256 indexed intentId, address indexed user, string description);
    event IntentExecuted(uint256 indexed intentId, address indexed user);
    
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
            timestamp: block.timestamp
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
        
        // Mint NFT as proof of execution
        mintTo(msg.sender, "");
        
        emit IntentExecuted(_intentId, msg.sender);
    }
    
    function getUserIntents(address _user) external view returns (uint256[] memory) {
        return userIntents[_user];
    }
    
    function getIntent(uint256 _intentId) external view returns (Intent memory) {
        return intents[_intentId];
    }
}
