const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WalletPlanner Enhanced Tests", function () {
  let walletPlanner;
  let owner;
  let user1;
  let user2;

  // Test token addresses (mock addresses for testing)
  const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const DAI_ADDRESS = "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357";
  const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const WalletPlanner = await ethers.getContractFactory("WalletPlanner");
    walletPlanner = await WalletPlanner.deploy(
      owner.address, // defaultAdmin
      "WalletPlanner", // name
      "WP", // symbol
      owner.address, // royaltyRecipient
      250, // royaltyBps (2.5%)
      "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008" // uniswapRouter (Sepolia)
    );
    await walletPlanner.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await walletPlanner.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await walletPlanner.name()).to.equal("WalletPlanner");
      expect(await walletPlanner.symbol()).to.equal("WP");
    });
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

  describe("Intent Creation", function () {
    it("Should create a basic intent", async function () {
      const description = "Test intent";
      const estimatedCost = ethers.parseEther("0.01");

      const tx = await walletPlanner.connect(user1).createIntent(description, estimatedCost);
      await expect(tx)
        .to.emit(walletPlanner, "IntentCreated")
        .withArgs(1, user1.address, description);
    });
  });

  describe("Intent Management", function () {
    it("Should get intent details", async function () {
      const description = "Test intent for details";
      const estimatedCost = ethers.parseEther("0.01");

      await walletPlanner.connect(user1).createIntent(description, estimatedCost);

      const intent = await walletPlanner.getIntent(1);
      expect(intent.user).to.equal(user1.address);
      expect(intent.description).to.equal(description);
      expect(intent.estimatedCost).to.equal(estimatedCost);
    });

    it("Should cancel intent", async function () {
      const description = "Test intent for cancellation";
      const estimatedCost = ethers.parseEther("0.01");

      await walletPlanner.connect(user1).createIntent(description, estimatedCost);

      await expect(walletPlanner.connect(user1).cancelIntent(1))
        .to.emit(walletPlanner, "IntentCancelled")
        .withArgs(1);

      const intent = await walletPlanner.getIntent(1);
      expect(intent.isActive).to.be.false;
    });
  });
});