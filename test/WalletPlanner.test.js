const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WalletPlanner", function () {
  let walletPlanner;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

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

    it("Should have the correct name and symbol", async function () {
      expect(await walletPlanner.name()).to.equal("WalletPlanner");
      expect(await walletPlanner.symbol()).to.equal("WP");
    });
  });

  describe("Intent Creation", function () {
    it("Should create an intent", async function () {
      const description = "Buy ETH when price drops below $2000";
      const estimatedCost = ethers.parseEther("0.01");

      await expect(walletPlanner.connect(addr1).createIntent(description, estimatedCost))
        .to.emit(walletPlanner, "IntentCreated")
        .withArgs(1, addr1.address, description);
    });

    it("Should increment intent counter", async function () {
      const description1 = "Intent 1";
      const description2 = "Intent 2";
      const estimatedCost = ethers.parseEther("0.01");

      await walletPlanner.connect(addr1).createIntent(description1, estimatedCost);
      await walletPlanner.connect(addr1).createIntent(description2, estimatedCost);

      const userIntents = await walletPlanner.getUserIntents(addr1.address);
      expect(userIntents.length).to.equal(2);
    });
  });

  describe("Intent Management", function () {
    it("Should get intent details", async function () {
      const description = "Buy ETH when price drops below $2000";
      const estimatedCost = ethers.parseEther("0.01");

      await walletPlanner.connect(addr1).createIntent(description, estimatedCost);

      const intent = await walletPlanner.getIntent(1);
      expect(intent.user).to.equal(addr1.address);
      expect(intent.description).to.equal(description);
      expect(intent.estimatedCost).to.equal(estimatedCost);
    });

    it("Should cancel intent", async function () {
      const description = "Buy ETH when price drops below $2000";
      const estimatedCost = ethers.parseEther("0.01");

      await walletPlanner.connect(addr1).createIntent(description, estimatedCost);

      await expect(walletPlanner.connect(addr1).cancelIntent(1))
        .to.emit(walletPlanner, "IntentCancelled")
        .withArgs(1);

      const intent = await walletPlanner.getIntent(1);
      expect(intent.isActive).to.be.false;
    });
  });

  describe("User Intents", function () {
    it("Should return correct user intents", async function () {
      const description1 = "Buy ETH when price drops below $2000";
      const description2 = "Sell BTC when price rises above $50000";
      const estimatedCost = ethers.parseEther("0.01");

      await walletPlanner.connect(addr1).createIntent(description1, estimatedCost);
      await walletPlanner.connect(addr1).createIntent(description2, estimatedCost);

      const userIntents = await walletPlanner.getUserIntents(addr1.address);
      expect(userIntents.length).to.equal(2);
      expect(userIntents[0]).to.equal(1);
      expect(userIntents[1]).to.equal(2);
    });

    it("Should return empty array for user with no intents", async function () {
      const userIntents = await walletPlanner.getUserIntents(addr2.address);
      expect(userIntents.length).to.equal(0);
    });
  });
});