// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@thirdweb-dev/contracts/base/ERC721Base.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IUniswapV2Router02 {
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function WETH() external pure returns (address);
}

contract WalletPlanner is ERC721Base, AutomationCompatible {

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

    uint256 private _nextIntentId;
    mapping(uint256 => Intent) public intents;
    mapping(address => uint256[]) public userIntents;
    mapping(address => mapping(address => uint256)) public userBalances;
    mapping(address => bool) public supportedTokens;

    IUniswapV2Router02 public immutable uniswapRouter;

    uint256 public constant INTERVAL = 1 hours;
    uint256 public lastChecked;
    address public functionsConsumer;
    uint256 public constant MAX_SLIPPAGE = 500;
    uint256 public constant DEFAULT_SLIPPAGE = 200;

    address public constant USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;
    address public constant DAI = 0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357;
    address public constant WETH = 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14;

    event IntentCreated(uint256 indexed intentId, address indexed user);
    event IntentExecuted(uint256 indexed intentId, address indexed user);
    event AutomationPerformed(uint256 timestamp, uint256 intentsProcessed);
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
        uniswapRouter = IUniswapV2Router02(_uniswapRouter != address(0) ? _uniswapRouter : 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008);
        supportedTokens[USDC] = true;
        supportedTokens[DAI] = true;
        supportedTokens[WETH] = true;
    }

    function depositToken(address token, uint256 amount) external {
        require(supportedTokens[token] && amount > 0);
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        userBalances[msg.sender][token] += amount;
        emit TokenDeposited(msg.sender, token, amount);
    }

    function withdrawToken(address token, uint256 amount) external {
        require(userBalances[msg.sender][token] >= amount);
        userBalances[msg.sender][token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        emit TokenWithdrawn(msg.sender, token, amount);
    }

    function getUserBalance(address user, address token) external view returns (uint256) {
        return userBalances[user][token];
    }

    function executeSwap(address tokenIn, uint256 amountIn, address tokenOut, address recipient, uint256 slippageTolerance) external returns (uint256 amountOut) {
        return _executeSwapInternal(tokenIn, amountIn, tokenOut, recipient, slippageTolerance);
    }

    function createSwapIntent(string memory _description, uint256 _estimatedCost, address _tokenIn, uint256 _amountIn, address _tokenOut, uint256 _slippageTolerance) external returns (uint256) {
        require(supportedTokens[_tokenIn] && userBalances[msg.sender][_tokenIn] >= _amountIn && _slippageTolerance <= MAX_SLIPPAGE);
        uint256 intentId = _nextIntentId++;
        intents[intentId] = Intent(intentId, msg.sender, _description, _estimatedCost, block.timestamp, 0, false, false, _tokenIn, _amountIn, _tokenOut, _slippageTolerance > 0 ? _slippageTolerance : DEFAULT_SLIPPAGE);
        userIntents[msg.sender].push(intentId);
        emit IntentCreated(intentId, msg.sender);
        return intentId;
    }

    function createScheduledSwapIntent(string memory _description, uint256 _estimatedCost, uint256 _executionTime, address _tokenIn, uint256 _amountIn, address _tokenOut, uint256 _slippageTolerance) external returns (uint256) {
        require(_executionTime > block.timestamp && supportedTokens[_tokenIn] && userBalances[msg.sender][_tokenIn] >= _amountIn && _slippageTolerance <= MAX_SLIPPAGE);
        uint256 intentId = _nextIntentId++;
        intents[intentId] = Intent(intentId, msg.sender, _description, _estimatedCost, block.timestamp, _executionTime, false, true, _tokenIn, _amountIn, _tokenOut, _slippageTolerance > 0 ? _slippageTolerance : DEFAULT_SLIPPAGE);
        userIntents[msg.sender].push(intentId);
        emit IntentCreated(intentId, msg.sender);
        return intentId;
    }

    function createIntent(string memory _description, uint256 _estimatedCost) external returns (uint256) {
        uint256 intentId = _nextIntentId++;
        intents[intentId] = Intent(intentId, msg.sender, _description, _estimatedCost, block.timestamp, 0, false, false, address(0), 0, address(0), 0);
        userIntents[msg.sender].push(intentId);
        emit IntentCreated(intentId, msg.sender);
        return intentId;
    }

    function executeIntent(uint256 _intentId) external {
        Intent storage intent = intents[_intentId];
        require(intent.user == msg.sender && !intent.executed);
        intent.executed = true;
        if (intent.tokenIn != address(0) && intent.amountIn > 0) {
            _executeSwapInternal(intent.tokenIn, intent.amountIn, intent.tokenOut, intent.user, intent.slippageTolerance);
        }
        _mint(msg.sender, 1);
        emit IntentExecuted(_intentId, msg.sender);
    }

    function _executeSwapInternal(address tokenIn, uint256 amountIn, address tokenOut, address user, uint256 slippageTolerance) internal returns (uint256 amountOut) {
        require(supportedTokens[tokenIn] && userBalances[user][tokenIn] >= amountIn && slippageTolerance <= MAX_SLIPPAGE);
        userBalances[user][tokenIn] -= amountIn;
        IERC20(tokenIn).approve(address(uniswapRouter), amountIn);

        address[] memory path;
        if (tokenOut == address(0)) {
            path = new address[](2);
            path[0] = tokenIn;
            path[1] = WETH;
            uint256[] memory expectedAmounts = uniswapRouter.getAmountsOut(amountIn, path);
            uint256 amountOutMin = (expectedAmounts[1] * (10000 - slippageTolerance)) / 10000;
            uint256[] memory amounts = uniswapRouter.swapExactTokensForETH(amountIn, amountOutMin, path, user, block.timestamp + 300);
            amountOut = amounts[1];
        } else {
            if (tokenIn == WETH || tokenOut == WETH) {
                path = new address[](2);
                path[0] = tokenIn;
                path[1] = tokenOut;
            } else {
                path = new address[](3);
                path[0] = tokenIn;
                path[1] = WETH;
                path[2] = tokenOut;
            }
            uint256[] memory expectedAmounts = uniswapRouter.getAmountsOut(amountIn, path);
            uint256 amountOutMin = (expectedAmounts[expectedAmounts.length - 1] * (10000 - slippageTolerance)) / 10000;
            uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(amountIn, amountOutMin, path, user, block.timestamp + 300);
            amountOut = amounts[amounts.length - 1];
        }
        emit SwapExecuted(user, tokenIn, tokenOut, amountIn, amountOut);
    }

    function getSwapEstimate(address tokenIn, uint256 amountIn, address tokenOut) external view returns (uint256 estimatedAmountOut) {
        address[] memory path;
        if (tokenOut == address(0)) {
            path = new address[](2);
            path[0] = tokenIn;
            path[1] = WETH;
        } else {
            path = new address[](tokenIn == WETH || tokenOut == WETH ? 2 : 3);
            path[0] = tokenIn;
            path[1] = tokenIn == WETH || tokenOut == WETH ? tokenOut : WETH;
            if (path.length == 3) path[2] = tokenOut;
        }
        try uniswapRouter.getAmountsOut(amountIn, path) returns (uint256[] memory amounts) {
            estimatedAmountOut = amounts[amounts.length - 1];
        } catch {
            estimatedAmountOut = 0;
        }
    }

    function addSupportedToken(address token) external onlyOwner { supportedTokens[token] = true; }
    function removeSupportedToken(address token) external onlyOwner { supportedTokens[token] = false; }
    function getUserIntents(address _user) external view returns (uint256[] memory) { return userIntents[_user]; }
    function getIntent(uint256 _intentId) external view returns (Intent memory) { return intents[_intentId]; }

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
                if (intent.tokenIn != address(0) && intent.amountIn > 0) {
                    _executeSwapInternal(intent.tokenIn, intent.amountIn, intent.tokenOut, intent.user, intent.slippageTolerance);
                }
                _mint(intent.user, 1);
                emit IntentExecuted(i, intent.user);
            }
        }
        emit AutomationPerformed(block.timestamp, processed);
    }

    function setFunctionsConsumer(address _functionsConsumer) external onlyOwner { functionsConsumer = _functionsConsumer; }
    function _canMint() internal view virtual override returns (bool) { return true; }
    function emergencyWithdraw(address token) external onlyOwner { IERC20(token).transfer(owner(), IERC20(token).balanceOf(address(this))); }
    function emergencyWithdrawETH() external onlyOwner { payable(owner()).transfer(address(this).balance); }
    receive() external payable {}
}