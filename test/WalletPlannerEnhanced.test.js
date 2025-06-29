
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Enhanced WalletPlanner", function () {
  let walletPlanner;
  let owner;
  let user1;
  let user2;
  let mockERC20;
  let mockRouter;

  // Mock addresses (for testing)
  const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const DAI_ADDRESS = "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357";
  const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
  const ROUTER_ADDRESS = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock ERC20 token for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20.deploy("Mock USDC", "USDC", 6);
    await mockERC20.waitForDeployment();

    // Deploy WalletPlanner
    const WalletPlanner = await ethers.getContractFactory("WalletPlanner");
    walletPlanner = await WalletPlanner.deploy(
      owner.address,
      "WalletPlanner",
      "WPLAN", 
      owner.address,
      250, // 2.5% royalty
      ROUTER_ADDRESS
    );
    await walletPlanner.waitForDeployment();

    // Mint some tokens to user1 for testing
    await mockERC20.mint(user1.address, ethers.parseUnits("1000", 6));
  });

  describe("Token Management", function () {
    it("Should check supported tokens", async function () {
      expect(await walletPlanner.supportedTokens(USDC_ADDRESS)).to.be.true;
      expect(await walletPlanner.supportedTokens(DAI_ADDRESS)).to.be.true;
      expect(await walletPlanner.supportedTokens(WETH_ADDRESS)).to.be.true;
    });

    it("Should allow owner to add/remove supported tokens", async function () {
      const newToken = "0x1234567890123456789012345678901234567890";
      
      await walletPlanner.connect(owner).addSupportedToken(newToken);
      expect(await walletPlanner.supportedTokens(newToken)).to.be.true;
      
      await walletPlanner.connect(owner).removeSupportedToken(newToken);
      expect(await walletPlanner.supportedTokens(newToken)).to.be.false;
    });

    it("Should not allow non-owner to manage supported tokens", async function () {
      const newToken = "0x1234567890123456789012345678901234567890";
      
      await expect(
        walletPlanner.connect(user1).addSupportedToken(newToken)
      ).to.be.reverted;
    });
  });

  describe("Deposit and Withdrawal", function () {
    it("Should allow users to deposit supported tokens", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      // First approve the contract
      await mockERC20.connect(user1).approve(walletPlanner.target, amount);
      
      // Then deposit
      await expect(
        walletPlanner.connect(user1).depositToken(mockERC20.target, amount)
      ).to.emit(walletPlanner, "TokenDeposited")
       .withArgs(user1.address, mockERC20.target, amount);
       
      expect(await walletPlanner.getUserBalance(user1.address, mockERC20.target))
        .to.equal(amount);
    });

    it("Should allow users to withdraw deposited tokens", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      // Deposit first
      await mockERC20.connect(user1).approve(walletPlanner.target, amount);
      await walletPlanner.connect(user1).depositToken(mockERC20.target, amount);
      
      // Then withdraw
      await expect(
        walletPlanner.connect(user1).withdrawToken(mockERC20.target, amount)
      ).to.emit(walletPlanner, "TokenWithdrawn")
       .withArgs(user1.address, mockERC20.target, amount);
       
      expect(await walletPlanner.getUserBalance(user1.address, mockERC20.target))
        .to.equal(0);
    });

    it("Should not allow withdrawal of more than deposited", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      await expect(
        walletPlanner.connect(user1).withdrawToken(mockERC20.target, amount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should not allow deposit of unsupported tokens", async function () {
      const unsupportedToken = "0x1234567890123456789012345678901234567890";
      const amount = ethers.parseUnits("100", 6);
      
      await expect(
        walletPlanner.connect(user1).depositToken(unsupportedToken, amount)
      ).to.be.revertedWith("Token not supported");
    });
  });

  describe("Intent Creation", function () {
    it("Should create legacy intents", async function () {
      const description = "Test intent";
      const estimatedCost = ethers.parseEther("0.01");
      
      await expect(
        walletPlanner.connect(user1).createIntent(description, estimatedCost)
      ).to.emit(walletPlanner, "IntentCreated")
       .withArgs(0, user1.address, description);
       
      const intent = await walletPlanner.getIntent(0);
      expect(intent.description).to.equal(description);
      expect(intent.user).to.equal(user1.address);
    });

    it("Should create swap intents", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      // Deposit tokens first
      await mockERC20.connect(user1).approve(walletPlanner.target, amount);
      await walletPlanner.connect(user1).depositToken(mockERC20.target, amount);
      
      const description = "Swap 10 USDC to ETH";
      const estimatedCost = ethers.parseEther("0.01");
      const swapAmount = ethers.parseUnits("10", 6);
      const slippage = 200; // 2%
      
      await expect(
        walletPlanner.connect(user1).createSwapIntent(
          description,
          estimatedCost,
          mockERC20.target,
          swapAmount,
          ethers.ZeroAddress, // ETH
          slippage
        )
      ).to.emit(walletPlanner, "IntentCreated");
      
      const intent = await walletPlanner.getIntent(0);
      expect(intent.tokenIn).to.equal(mockERC20.target);
      expect(intent.amountIn).to.equal(swapAmount);
      expect(intent.slippageTolerance).to.equal(slippage);
    });

    it("Should not create swap intent with insufficient balance", async function () {
      const description = "Swap 100 USDC to ETH";
      const estimatedCost = ethers.parseEther("0.01");
      const swapAmount = ethers.parseUnits("100", 6);
      const slippage = 200;
      
      await expect(
        walletPlanner.connect(user1).createSwapIntent(
          description,
          estimatedCost,
          mockERC20.target,
          swapAmount,
          ethers.ZeroAddress,
          slippage
        )
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should not allow excessive slippage", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      // Deposit tokens first
      await mockERC20.connect(user1).approve(walletPlanner.target, amount);
      await walletPlanner.connect(user1).depositToken(mockERC20.target, amount);
      
      const description = "Swap with high slippage";
      const estimatedCost = ethers.parseEther("0.01");
      const swapAmount = ethers.parseUnits("10", 6);
      const highSlippage = 1000; // 10% - above max of 5%
      
      await expect(
        walletPlanner.connect(user1).createSwapIntent(
          description,
          estimatedCost,
          mockERC20.target,
          swapAmount,
          ethers.ZeroAddress,
          highSlippage
        )
      ).to.be.revertedWith("Slippage too high");
    });
  });

  describe("Intent Execution", function () {
    it("Should execute legacy intents", async function () {
      const description = "Test intent";
      const estimatedCost = ethers.parseEther("0.01");
      
      await walletPlanner.connect(user1).createIntent(description, estimatedCost);
      
      await expect(
        walletPlanner.connect(user1).executeIntent(0)
      ).to.emit(walletPlanner, "IntentExecuted")
       .withArgs(0, user1.address);
       
      const intent = await walletPlanner.getIntent(0);
      expect(intent.executed).to.be.true;
      
      // Should mint NFT
      expect(await walletPlanner.balanceOf(user1.address)).to.equal(1);
    });

    it("Should not allow unauthorized intent execution", async function () {
      const description = "Test intent";
      const estimatedCost = ethers.parseEther("0.01");
      
      await walletPlanner.connect(user1).createIntent(description, estimatedCost);
      
      await expect(
        walletPlanner.connect(user2).executeIntent(0)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should not allow double execution", async function () {
      const description = "Test intent";
      const estimatedCost = ethers.parseEther("0.01");
      
      await walletPlanner.connect(user1).createIntent(description, estimatedCost);
      await walletPlanner.connect(user1).executeIntent(0);
      
      await expect(
        walletPlanner.connect(user1).executeIntent(0)
      ).to.be.revertedWith("Already executed");
    });
  });

  describe("User Interface", function () {
    it("Should return user intents", async function () {
      const description1 = "Intent 1";
      const description2 = "Intent 2";
      const estimatedCost = ethers.parseEther("0.01");
      
      await walletPlanner.connect(user1).createIntent(description1, estimatedCost);
      await walletPlanner.connect(user1).createIntent(description2, estimatedCost);
      
      const userIntents = await walletPlanner.getUserIntents(user1.address);
      expect(userIntents.length).to.equal(2);
      expect(userIntents[0]).to.equal(0);
      expect(userIntents[1]).to.equal(1);
    });

    it("Should return correct user balances", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      expect(await walletPlanner.getUserBalance(user1.address, mockERC20.target))
        .to.equal(0);
        
      await mockERC20.connect(user1).approve(walletPlanner.target, amount);
      await walletPlanner.connect(user1).depositToken(mockERC20.target, amount);
      
      expect(await walletPlanner.getUserBalance(user1.address, mockERC20.target))
        .to.equal(amount);
    });
  });
});

// Mock ERC20 contract for testing
const MockERC20 = {
  bytecode: "0x",
  abi: [
    "function name() view returns (string)",
    "function symbol() view returns (string)", 
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function mint(address to, uint256 amount)"
  ]
};
