
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC721Base.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IUniswapV2Router02 {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts);
}

contract WalletPlanner is ERC721Base, AutomationCompatibleInterface {
    struct Intent {
        uint256 id;
        address user;
        string description;
        uint256 estimatedCost;
        uint256 timestamp;
        uint256 executionTime;
        bool executed;
        bool isScheduled;
        address tokenIn;
        uint256 amountIn;
        address tokenOut;
        uint256 slippageTolerance;
    }

    mapping(uint256 => Intent) public intents;
    mapping(address => uint256[]) public userIntents;
    mapping(address => mapping(address => uint256)) public userBalances;
    mapping(address => bool) public supportedTokens;
    
    uint256 public nextIntentId = 1;
    uint256 public nextTokenIdToMint = 1;
    
    IUniswapV2Router02 public uniswapRouter;
    
    event IntentCreated(uint256 indexed intentId, address indexed user, string description);
    event IntentExecuted(uint256 indexed intentId, address indexed user);
    event TokenDeposited(address indexed user, address indexed token, uint256 amount);
    event TokenWithdrawn(address indexed user, address indexed token, uint256 amount);
    event SwapExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps,
        address _uniswapRouter
    ) ERC721Base(_defaultAdmin, _name, _symbol, _royaltyRecipient, _royaltyBps) {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }

    function createIntent(
        string memory description,
        uint256 estimatedCost
    ) external returns (uint256) {
        uint256 intentId = nextIntentId++;
        
        intents[intentId] = Intent({
            id: intentId,
            user: msg.sender,
            description: description,
            estimatedCost: estimatedCost,
            timestamp: block.timestamp,
            executionTime: 0,
            executed: false,
            isScheduled: false,
            tokenIn: address(0),
            amountIn: 0,
            tokenOut: address(0),
            slippageTolerance: 0
        });
        
        userIntents[msg.sender].push(intentId);
        
        emit IntentCreated(intentId, msg.sender, description);
        return intentId;
    }

    function createSwapIntent(
        string memory description,
        uint256 estimatedCost,
        address tokenIn,
        uint256 amountIn,
        address tokenOut,
        uint256 slippageTolerance
    ) external returns (uint256) {
        require(supportedTokens[tokenIn] && supportedTokens[tokenOut], "Unsupported token");
        require(userBalances[msg.sender][tokenIn] >= amountIn, "Insufficient balance");
        
        uint256 intentId = nextIntentId++;
        
        intents[intentId] = Intent({
            id: intentId,
            user: msg.sender,
            description: description,
            estimatedCost: estimatedCost,
            timestamp: block.timestamp,
            executionTime: 0,
            executed: false,
            isScheduled: false,
            tokenIn: tokenIn,
            amountIn: amountIn,
            tokenOut: tokenOut,
            slippageTolerance: slippageTolerance
        });
        
        userIntents[msg.sender].push(intentId);
        
        emit IntentCreated(intentId, msg.sender, description);
        return intentId;
    }

    function createScheduledSwapIntent(
        string memory description,
        uint256 estimatedCost,
        uint256 executionTime,
        address tokenIn,
        uint256 amountIn,
        address tokenOut,
        uint256 slippageTolerance
    ) external returns (uint256) {
        require(supportedTokens[tokenIn] && supportedTokens[tokenOut], "Unsupported token");
        require(userBalances[msg.sender][tokenIn] >= amountIn, "Insufficient balance");
        require(executionTime > block.timestamp, "Execution time must be in the future");
        
        uint256 intentId = nextIntentId++;
        
        intents[intentId] = Intent({
            id: intentId,
            user: msg.sender,
            description: description,
            estimatedCost: estimatedCost,
            timestamp: block.timestamp,
            executionTime: executionTime,
            executed: false,
            isScheduled: true,
            tokenIn: tokenIn,
            amountIn: amountIn,
            tokenOut: tokenOut,
            slippageTolerance: slippageTolerance
        });
        
        userIntents[msg.sender].push(intentId);
        
        emit IntentCreated(intentId, msg.sender, description);
        return intentId;
    }

    function executeIntent(uint256 intentId) external {
        Intent storage intent = intents[intentId];
        require(intent.id != 0, "Intent does not exist");
        require(!intent.executed, "Intent already executed");
        require(intent.user == msg.sender, "Not authorized");
        
        if (intent.isScheduled) {
            require(block.timestamp >= intent.executionTime, "Not ready for execution");
        }
        
        if (intent.tokenIn != address(0) && intent.tokenOut != address(0)) {
            _performSwap(intent);
        }
        
        intent.executed = true;
        
        _mintNFT(msg.sender);
        
        emit IntentExecuted(intentId, msg.sender);
    }

    function _performSwap(Intent memory intent) internal {
        require(userBalances[intent.user][intent.tokenIn] >= intent.amountIn, "Insufficient balance");
        
        userBalances[intent.user][intent.tokenIn] -= intent.amountIn;
        
        address[] memory path = new address[](2);
        path[0] = intent.tokenIn;
        path[1] = intent.tokenOut;
        
        uint[] memory amountsOut = uniswapRouter.getAmountsOut(intent.amountIn, path);
        uint256 amountOutMin = (amountsOut[1] * (10000 - intent.slippageTolerance)) / 10000;
        
        IERC20(intent.tokenIn).approve(address(uniswapRouter), intent.amountIn);
        
        uint[] memory amounts = uniswapRouter.swapExactTokensForTokens(
            intent.amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp + 300
        );
        
        userBalances[intent.user][intent.tokenOut] += amounts[1];
        
        emit SwapExecuted(intent.user, intent.tokenIn, intent.tokenOut, intent.amountIn, amounts[1]);
    }

    function _mintNFT(address to) internal {
        uint256 tokenId = nextTokenIdToMint;
        nextTokenIdToMint++;
        _mint(to, tokenId);
    }

    function depositToken(address token, uint256 amount) external {
        require(supportedTokens[token], "Token not supported");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        userBalances[msg.sender][token] += amount;
        
        emit TokenDeposited(msg.sender, token, amount);
    }

    function withdrawToken(address token, uint256 amount) external {
        require(userBalances[msg.sender][token] >= amount, "Insufficient balance");
        
        userBalances[msg.sender][token] -= amount;
        require(IERC20(token).transfer(msg.sender, amount), "Transfer failed");
        
        emit TokenWithdrawn(msg.sender, token, amount);
    }

    function executeSwap(
        address tokenIn,
        uint256 amountIn,
        address tokenOut,
        address recipient,
        uint256 slippageTolerance
    ) external returns (uint256) {
        require(supportedTokens[tokenIn] && supportedTokens[tokenOut], "Unsupported token");
        require(userBalances[msg.sender][tokenIn] >= amountIn, "Insufficient balance");
        
        userBalances[msg.sender][tokenIn] -= amountIn;
        
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        
        uint[] memory amountsOut = uniswapRouter.getAmountsOut(amountIn, path);
        uint256 amountOutMin = (amountsOut[1] * (10000 - slippageTolerance)) / 10000;
        
        IERC20(tokenIn).approve(address(uniswapRouter), amountIn);
        
        uint[] memory amounts = uniswapRouter.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            recipient,
            block.timestamp + 300
        );
        
        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amounts[1]);
        return amounts[1];
    }

    function getUserIntents(address user) external view returns (uint256[] memory) {
        return userIntents[user];
    }

    function getIntent(uint256 intentId) external view returns (Intent memory) {
        return intents[intentId];
    }

    function getUserBalance(address user, address token) external view returns (uint256) {
        return userBalances[user][token];
    }

    function getSwapEstimate(address tokenIn, uint256 amountIn, address tokenOut) external view returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        
        uint[] memory amountsOut = uniswapRouter.getAmountsOut(amountIn, path);
        return amountsOut[1];
    }

    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        uint256[] memory readyIntents = new uint256[](100);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextIntentId && count < 100; i++) {
            Intent storage intent = intents[i];
            if (intent.isScheduled && !intent.executed && block.timestamp >= intent.executionTime) {
                readyIntents[count] = i;
                count++;
            }
        }
        
        upkeepNeeded = count > 0;
        if (upkeepNeeded) {
            uint256[] memory intentIds = new uint256[](count);
            for (uint256 i = 0; i < count; i++) {
                intentIds[i] = readyIntents[i];
            }
            performData = abi.encode(intentIds);
        }
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256[] memory intentIds = abi.decode(performData, (uint256[]));
        
        for (uint256 i = 0; i < intentIds.length; i++) {
            Intent storage intent = intents[intentIds[i]];
            if (intent.isScheduled && !intent.executed && block.timestamp >= intent.executionTime) {
                if (intent.tokenIn != address(0) && intent.tokenOut != address(0)) {
                    _performSwap(intent);
                }
                intent.executed = true;
                _mintNFT(intent.user);
                emit IntentExecuted(intentIds[i], intent.user);
            }
        }
    }
}
