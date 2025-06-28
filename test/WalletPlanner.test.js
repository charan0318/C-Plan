import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("WalletPlanner", function () {
  let WalletPlanner;
  let walletPlanner;
  let owner;
  let addr1;
  let addr2;
  let defaultAdmin;
  let royaltyRecipient;

  beforeEach(async function () {
    [owner, addr1, addr2, defaultAdmin, royaltyRecipient] = await ethers.getSigners();

    WalletPlanner = await ethers.getContractFactory("WalletPlanner");
    walletPlanner = await WalletPlanner.deploy(
      defaultAdmin.address,
      "C-PLAN Wallet Intents",
      "CPLAN",
      royaltyRecipient.address,
      250 // 2.5% royalty
    );

    await walletPlanner.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy the contract correctly", async function () {
      expect(await walletPlanner.getAddress()).to.be.properAddress;
    });

    it("Should set the correct name and symbol", async function () {
      expect(await walletPlanner.name()).to.equal("C-PLAN Wallet Intents");
      expect(await walletPlanner.symbol()).to.equal("CPLAN");
    });

    it("Should initialize with zero intents", async function () {
      const userIntents = await walletPlanner.getUserIntents(addr1.address);
      expect(userIntents.length).to.equal(0);
    });
  });

  describe("Intent Creation", function () {
    it("Should allow users to create a new intent", async function () {
      const description = "Stake 100 USDC weekly when gas < 20 gwei";
      const estimatedCost = ethers.parseEther("0.1");

      const tx = await walletPlanner.connect(addr1).createIntent(description, estimatedCost);
      const receipt = await tx.wait();

      // Check for IntentCreated event
      const event = receipt.logs.find(log => {
        try {
          const parsed = walletPlanner.interface.parseLog(log);
          return parsed.name === "IntentCreated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;

      const parsedEvent = walletPlanner.interface.parseLog(event);
      expect(parsedEvent.args.intentId).to.equal(0);
      expect(parsedEvent.args.user).to.equal(addr1.address);
      expect(parsedEvent.args.description).to.equal(description);
    });

    it("Should increment intent IDs correctly", async function () {
      await walletPlanner.connect(addr1).createIntent("First intent", ethers.parseEther("0.1"));
      await walletPlanner.connect(addr1).createIntent("Second intent", ethers.parseEther("0.2"));

      const userIntents = await walletPlanner.getUserIntents(addr1.address);
      expect(userIntents.length).to.equal(2);
      expect(userIntents[0]).to.equal(0);
      expect(userIntents[1]).to.equal(1);
    });

    it("Should store intent data correctly", async function () {
      const description = "Test intent description";
      const estimatedCost = ethers.parseEther("0.5");

      await walletPlanner.connect(addr1).createIntent(description, estimatedCost);

      const intent = await walletPlanner.getIntent(0);
      expect(intent.id).to.equal(0);
      expect(intent.user).to.equal(addr1.address);
      expect(intent.description).to.equal(description);
      expect(intent.estimatedCost).to.equal(estimatedCost);
      expect(intent.executed).to.be.false;
      expect(intent.timestamp).to.be.greaterThan(0);
    });

    it("Should allow empty description", async function () {
      await expect(walletPlanner.connect(addr1).createIntent("", ethers.parseEther("0.1")))
        .to.not.be.reverted;
    });

    it("Should allow zero estimated cost", async function () {
      await expect(walletPlanner.connect(addr1).createIntent("Free action", 0))
        .to.not.be.reverted;
    });
  });

  describe("Scheduled Intents", function () {
    it("Should allow creating scheduled intents", async function () {
      const description = "Stake 100 USDC weekly when gas < 20 gwei";
      const estimatedCost = ethers.parseEther("0.1");
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      const tx = await walletPlanner.connect(addr1).createScheduledIntent(
        description,
        estimatedCost,
        futureTime
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === "IntentCreated");
      expect(event).to.not.be.undefined;

      const intentId = event.args[0];
      const intent = await walletPlanner.getIntent(intentId);

      expect(intent.description).to.equal(description);
      expect(intent.isScheduled).to.be.true;
      expect(intent.executionTime).to.equal(futureTime);
    });

    it("Should not allow creating scheduled intents with past execution time", async function () {
      const description = "Test intent";
      const estimatedCost = ethers.parseEther("0.1");
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

      await expect(
        walletPlanner.connect(addr1).createScheduledIntent(
          description,
          estimatedCost,
          pastTime
        )
      ).to.be.revertedWith("Execution time must be in the future");
    });
  });

  describe("Automation", function () {
    it("Should return false for checkUpkeep when no intents are ready", async function () {
      const [upkeepNeeded] = await walletPlanner.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.false;
    });

    it("Should return true for checkUpkeep when scheduled intents are ready", async function () {
      // Create a scheduled intent with execution time in the past
      const description = "Test scheduled intent";
      const estimatedCost = ethers.parseEther("0.1");
      const pastTime = Math.floor(Date.now() / 1000) - 1; // 1 second ago

      await walletPlanner.connect(addr1).createScheduledIntent(
        description,
        estimatedCost,
        pastTime
      );

      // Advance time beyond the interval
      await ethers.provider.send("evm_increaseTime", [3601]); // 1 hour + 1 second
      await ethers.provider.send("evm_mine");

      const [upkeepNeeded] = await walletPlanner.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.true;
    });
  });

  describe("Intent Execution", function () {
    it("Should allow intent owner to execute their intent", async function () {
      const tx = await walletPlanner.connect(addr1).executeIntent(0);
      const receipt = await tx.wait();

      // Check for IntentExecuted event
      const event = receipt.logs.find(log => {
        try {
          const parsed = walletPlanner.interface.parseLog(log);
          return parsed.name === "IntentExecuted";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;

      const parsedEvent = walletPlanner.interface.parseLog(event);
      expect(parsedEvent.args.intentId).to.equal(0);
      expect(parsedEvent.args.user).to.equal(addr1.address);
    });

    it("Should mark intent as executed", async function () {
      await walletPlanner.connect(addr1).executeIntent(0);

      const intent = await walletPlanner.getIntent(0);
      expect(intent.executed).to.be.true;
    });

    it("Should mint NFT on execution", async function () {
      const balanceBefore = await walletPlanner.balanceOf(addr1.address);

      await walletPlanner.connect(addr1).executeIntent(0);

      const balanceAfter = await walletPlanner.balanceOf(addr1.address);
      expect(balanceAfter).to.equal(balanceBefore + 1n);
    });

    it("Should prevent unauthorized users from executing intent", async function () {
      await expect(walletPlanner.connect(addr2).executeIntent(0))
        .to.be.revertedWith("Not authorized");
    });

    it("Should prevent double execution", async function () {
      await walletPlanner.connect(addr1).executeIntent(0);

      await expect(walletPlanner.connect(addr1).executeIntent(0))
        .to.be.revertedWith("Already executed");
    });

    it("Should revert for non-existent intent", async function () {
      await expect(walletPlanner.connect(addr1).executeIntent(999))
        .to.be.revertedWith("Not authorized");
    });
  });

  describe("Intent Retrieval", function () {
    beforeEach(async function () {
      await walletPlanner.connect(addr1).createIntent("Intent 1", ethers.parseEther("0.1"));
      await walletPlanner.connect(addr1).createIntent("Intent 2", ethers.parseEther("0.2"));
      await walletPlanner.connect(addr2).createIntent("Intent 3", ethers.parseEther("0.3"));
    });

    it("Should return correct user intents", async function () {
      const addr1Intents = await walletPlanner.getUserIntents(addr1.address);
      const addr2Intents = await walletPlanner.getUserIntents(addr2.address);

      expect(addr1Intents.length).to.equal(2);
      expect(addr2Intents.length).to.equal(1);

      expect(addr1Intents[0]).to.equal(0);
      expect(addr1Intents[1]).to.equal(1);
      expect(addr2Intents[0]).to.equal(2);
    });

    it("Should return empty array for users with no intents", async function () {
      const noIntents = await walletPlanner.getUserIntents(defaultAdmin.address);
      expect(noIntents.length).to.equal(0);
    });

    it("Should retrieve specific intent correctly", async function () {
      const intent = await walletPlanner.getIntent(1);

      expect(intent.id).to.equal(1);
      expect(intent.user).to.equal(addr1.address);
      expect(intent.description).to.equal("Intent 2");
      expect(intent.estimatedCost).to.equal(ethers.parseEther("0.2"));
      expect(intent.executed).to.be.false;
    });
  });

  describe("Edge Cases and Security", function () {
    it("Should handle very long descriptions", async function () {
      const longDescription = "A".repeat(1000);

      await expect(walletPlanner.connect(addr1).createIntent(longDescription, ethers.parseEther("0.1")))
        .to.not.be.reverted;
    });

    it("Should handle maximum uint256 estimated cost", async function () {
      const maxCost = ethers.MaxUint256;

      await expect(walletPlanner.connect(addr1).createIntent("Max cost intent", maxCost))
        .to.not.be.reverted;
    });

    it("Should maintain separate intent counters per user", async function () {
      await walletPlanner.connect(addr1).createIntent("User 1 Intent 1", ethers.parseEther("0.1"));
      await walletPlanner.connect(addr2).createIntent("User 2 Intent 1", ethers.parseEther("0.2"));
      await walletPlanner.connect(addr1).createIntent("User 1 Intent 2", ethers.parseEther("0.3"));

      const addr1Intents = await walletPlanner.getUserIntents(addr1.address);
      const addr2Intents = await walletPlanner.getUserIntents(addr2.address);

      expect(addr1Intents.length).to.equal(2);
      expect(addr2Intents.length).to.equal(1);
    });

    it("Should preserve intent data after execution", async function () {
      const description = "Test preservation";
      const estimatedCost = ethers.parseEther("0.5");

      await walletPlanner.connect(addr1).createIntent(description, estimatedCost);
      await walletPlanner.connect(addr1).executeIntent(0);

      const intent = await walletPlanner.getIntent(0);
      expect(intent.description).to.equal(description);
      expect(intent.estimatedCost).to.equal(estimatedCost);
      expect(intent.executed).to.be.true;
    });
  });

  describe("Multiple Users", function () {
    it("Should handle multiple users creating intents simultaneously", async function () {
      const promises = [];

      for (let i = 0; i < 5; i++) {
        promises.push(
          walletPlanner.connect(addr1).createIntent(`Addr1 Intent ${i}`, ethers.parseEther("0.1"))
        );
        promises.push(
          walletPlanner.connect(addr2).createIntent(`Addr2 Intent ${i}`, ethers.parseEther("0.2"))
        );
      }

      await Promise.all(promises);

      const addr1Intents = await walletPlanner.getUserIntents(addr1.address);
      const addr2Intents = await walletPlanner.getUserIntents(addr2.address);

      expect(addr1Intents.length).to.equal(5);
      expect(addr2Intents.length).to.equal(5);
    });

    it("Should maintain correct intent ownership", async function () {
      await walletPlanner.connect(addr1).createIntent("Addr1 Intent", ethers.parseEther("0.1"));
      await walletPlanner.connect(addr2).createIntent("Addr2 Intent", ethers.parseEther("0.2"));

      const intent0 = await walletPlanner.getIntent(0);
      const intent1 = await walletPlanner.getIntent(1);

      expect(intent0.user).to.equal(addr1.address);
      expect(intent1.user).to.equal(addr2.address);
    });
  });

  describe("Gas Optimization", function () {
    it("Should create intents efficiently", async function () {
      const tx = await walletPlanner.connect(addr1).createIntent("Gas test", ethers.parseEther("0.1"));
      const receipt = await tx.wait();

      // Basic gas usage check - should be reasonable for a simple operation
      expect(receipt.gasUsed).to.be.lessThan(200000);
    });

    it("Should execute intents efficiently", async function () {
      await walletPlanner.connect(addr1).createIntent("Gas test", ethers.parseEther("0.1"));

      const tx = await walletPlanner.connect(addr1).executeIntent(0);
      const receipt = await tx.wait();

      // Gas usage should be reasonable including NFT minting
      expect(receipt.gasUsed).to.be.lessThan(300000);
    });
  });
});