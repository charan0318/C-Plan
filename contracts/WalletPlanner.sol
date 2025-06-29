
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@thirdweb-dev/contracts/base/ERC721Base.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IUniswapV2Router02 {
    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts);
    
    function WETH() external pure returns (address);
}

contract WalletPlanner is ERC721Base, AutomationCompatible, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    struct Intent {
        uint256 id;
        address user;
        string description;
        uint256 estimatedCost;
        uint256 timestamp;
        uint256 executionTime;
        bool executed;
        bool isScheduled;
        // New swap-related fields
        address tokenIn;
        uint256 amountIn;
        address tokenOut;
        uint256 slippageTolerance; // in basis points (100 = 1%)
    }

    uint256 private _nextIntentId;
    mapping(uint256 => Intent) public intents;
    mapping(address => uint256[]) public userIntents;
    
    // User token balances
    mapping(address => mapping(address => uint256)) public userBalances;
    
    // Supported tokens
    mapping(address => bool) public supportedTokens;
    
    // Uniswap router
    IUniswapV2Router02 public immutable uniswapRouter;
    
    // Constants
    uint256 public constant INTERVAL = 1 hours;
    uint256 public lastChecked;
    address public functionsConsumer;
    uint256 public constant MAX_SLIPPAGE = 500; // 5% max slippage
    uint256 public constant DEFAULT_SLIPPAGE = 200; // 2% default slippage
    
    // Sepolia testnet addresses
    address public constant USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238; // Sepolia USDC
    address public constant DAI = 0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357; // Sepolia DAI
    address public constant WETH = 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14; // Sepolia WETH

    event IntentCreated(uint256 indexed intentId, address indexed user, string description);
    event IntentExecuted(uint256 indexed intentId, address indexed user);
    event AutomationPerformed(uint256 timestamp, uint256 intentsProcessed);
    event TokenDeposited(address indexed user, address indexed token, uint256 amount);
    event TokenWithdrawn(address indexed user, address indexed token, uint256 amount);
    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps,
        address _uniswapRouter
    )
        ERC721Base(
            _defaultAdmin,
            _name,
            _symbol,
            _royaltyRecipient,
            _royaltyBps
        )
    {
        if (_uniswapRouter != address(0)) {
            uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        } else {
            // Default Sepolia Uniswap V2 Router
            uniswapRouter = IUniswapV2Router02(0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008);
        }
        
        // Set supported tokens
        supportedTokens[USDC] = true;
        supportedTokens[DAI] = true;
        supportedTokens[WETH] = true;
    }

    // A. Add Funds Logic
    function depositToken(address token, uint256 amount) external nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        userBalances[msg.sender][token] += amount;
        
        emit TokenDeposited(msg.sender, token, amount);
    }
    
    function withdrawToken(address token, uint256 amount) external nonReentrant {
        require(userBalances[msg.sender][token] >= amount, "Insufficient balance");
        
        userBalances[msg.sender][token] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit TokenWithdrawn(msg.sender, token, amount);
    }
    
    function getUserBalance(address user, address token) external view returns (uint256) {
        return userBalances[user][token];
    }

    // B. Swap Execution via Uniswap
    function executeSwap(
        address tokenIn,
        uint256 amountIn,
        address tokenOut,
        address recipient,
        uint256 slippageTolerance
    ) external nonReentrant returns (uint256 amountOut) {
        require(supportedTokens[tokenIn], "Input token not supported");
        require(userBalances[msg.sender][tokenIn] >= amountIn, "Insufficient balance");
        require(slippageTolerance <= MAX_SLIPPAGE, "Slippage too high");
        
        userBalances[msg.sender][tokenIn] -= amountIn;
        
        // Approve router to spend tokens
        IERC20(tokenIn).safeApprove(address(uniswapRouter), amountIn);
        
        address[] memory path;
        if (tokenOut == address(0)) {
            // Swap to ETH
            path = new address[](2);
            path[0] = tokenIn;
            path[1] = WETH;
            
            uint256[] memory expectedAmounts = uniswapRouter.getAmountsOut(amountIn, path);
            uint256 amountOutMin = (expectedAmounts[1] * (10000 - slippageTolerance)) / 10000;
            
            uint256[] memory amounts = uniswapRouter.swapExactTokensForETH(
                amountIn,
                amountOutMin,
                path,
                recipient,
                block.timestamp + 300 // 5 minutes deadline
            );
            
            amountOut = amounts[1];
        } else {
            // Swap token to token
            if (tokenIn == WETH) {
                path = new address[](2);
                path[0] = tokenIn;
                path[1] = tokenOut;
            } else if (tokenOut == WETH) {
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
            
            uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                path,
                recipient,
                block.timestamp + 300 // 5 minutes deadline
            );
            
            amountOut = amounts[amounts.length - 1];
        }
        
        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    // Enhanced intent creation with swap parameters
    function createSwapIntent(
        string memory _description,
        uint256 _estimatedCost,
        address _tokenIn,
        uint256 _amountIn,
        address _tokenOut,
        uint256 _slippageTolerance
    ) external returns (uint256) {
        require(supportedTokens[_tokenIn], "Input token not supported");
        require(userBalances[msg.sender][_tokenIn] >= _amountIn, "Insufficient balance");
        require(_slippageTolerance <= MAX_SLIPPAGE, "Slippage too high");
        
        uint256 intentId = _nextIntentId++;
        
        intents[intentId] = Intent({
            id: intentId,
            user: msg.sender,
            description: _description,
            estimatedCost: _estimatedCost,
            timestamp: block.timestamp,
            executionTime: 0,
            executed: false,
            isScheduled: false,
            tokenIn: _tokenIn,
            amountIn: _amountIn,
            tokenOut: _tokenOut,
            slippageTolerance: _slippageTolerance > 0 ? _slippageTolerance : DEFAULT_SLIPPAGE
        });

        userIntents[msg.sender].push(intentId);
        emit IntentCreated(intentId, msg.sender, _description);
        return intentId;
    }

    function createScheduledSwapIntent(
        string memory _description,
        uint256 _estimatedCost,
        uint256 _executionTime,
        address _tokenIn,
        uint256 _amountIn,
        address _tokenOut,
        uint256 _slippageTolerance
    ) external returns (uint256) {
        require(_executionTime > block.timestamp, "Execution time must be in the future");
        require(supportedTokens[_tokenIn], "Input token not supported");
        require(userBalances[msg.sender][_tokenIn] >= _amountIn, "Insufficient balance");
        require(_slippageTolerance <= MAX_SLIPPAGE, "Slippage too high");

        uint256 intentId = _nextIntentId++;

        intents[intentId] = Intent({
            id: intentId,
            user: msg.sender,
            description: _description,
            estimatedCost: _estimatedCost,
            timestamp: block.timestamp,
            executionTime: _executionTime,
            executed: false,
            isScheduled: true,
            tokenIn: _tokenIn,
            amountIn: _amountIn,
            tokenOut: _tokenOut,
            slippageTolerance: _slippageTolerance > 0 ? _slippageTolerance : DEFAULT_SLIPPAGE
        });

        userIntents[msg.sender].push(intentId);
        emit IntentCreated(intentId, msg.sender, _description);
        return intentId;
    }

    // Legacy intent creation (for backward compatibility)
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
        emit IntentCreated(intentId, msg.sender, _description);
        return intentId;
    }

    function executeIntent(uint256 _intentId) external nonReentrant {
        Intent storage intent = intents[_intentId];
        require(intent.user == msg.sender, "Not authorized");
        require(!intent.executed, "Already executed");

        intent.executed = true;
        
        // If this is a swap intent, execute the swap
        if (intent.tokenIn != address(0) && intent.amountIn > 0) {
            executeSwap(
                intent.tokenIn,
                intent.amountIn,
                intent.tokenOut,
                intent.user,
                intent.slippageTolerance
            );
        }
        
        _mint(msg.sender, 1);
        emit IntentExecuted(_intentId, msg.sender);
    }

    // Helper functions for price estimation
    function getSwapEstimate(
        address tokenIn,
        uint256 amountIn,
        address tokenOut
    ) external view returns (uint256 estimatedAmountOut) {
        address[] memory path;
        
        if (tokenOut == address(0)) {
            // Estimate for ETH
            path = new address[](2);
            path[0] = tokenIn;
            path[1] = WETH;
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
        }
        
        try uniswapRouter.getAmountsOut(amountIn, path) returns (uint256[] memory amounts) {
            estimatedAmountOut = amounts[amounts.length - 1];
        } catch {
            estimatedAmountOut = 0;
        }
    }

    // Admin functions
    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }
    
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    // Original functions (for backward compatibility)
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
                
                // Execute swap if applicable
                if (intent.tokenIn != address(0) && intent.amountIn > 0) {
                    try this.executeSwap(
                        intent.tokenIn,
                        intent.amountIn,
                        intent.tokenOut,
                        intent.user,
                        intent.slippageTolerance
                    ) {
                        // Swap executed successfully
                    } catch {
                        // Swap failed, but still mint NFT
                    }
                }
                
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

    // Emergency functions
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransfer(owner(), balance);
    }

    function emergencyWithdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Receive ETH
    receive() external payable {}
}
