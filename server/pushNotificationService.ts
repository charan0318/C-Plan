
import * as PushAPI from "@pushprotocol/restapi";
import { ethers } from "ethers";

export class PushNotificationService {
  private signer: ethers.Wallet;
  private channelAddress: string;
  private env: "prod" | "staging" = "staging";

  constructor() {
    // Initialize with your channel's private key (store in secrets in production)
    const channelPrivateKey = process.env.PUSH_CHANNEL_PRIVATE_KEY || "0x" + "0".repeat(64);
    this.signer = new ethers.Wallet(channelPrivateKey);
    this.channelAddress = process.env.PUSH_CHANNEL_ADDRESS || this.signer.address;
  }

  async sendNotification(
    recipientAddress: string,
    title: string,
    body: string,
    cta?: string,
    img?: string
  ) {
    try {
      await PushAPI.payloads.sendNotification({
        signer: this.signer,
        type: 3, // target specific users
        identityType: 2, // direct payload
        notification: {
          title,
          body
        },
        payload: {
          title,
          body,
          cta: cta || "",
          img: img || ""
        },
        recipients: `eip155:11155111:${recipientAddress}`, // Sepolia testnet
        channel: `eip155:11155111:${this.channelAddress}`,
        env: this.env,
      });

      console.log(`📱 Push notification sent to ${recipientAddress}: ${title}`);
      return true;
    } catch (error) {
      console.error("Failed to send Push notification:", error);
      return false;
    }
  }

  async notifyIntentCreated(userAddress: string, intentTitle: string, intentId: number) {
    return this.sendNotification(
      userAddress,
      "🎯 Intent Created",
      `Your automation plan "${intentTitle}" has been created successfully! Intent #${intentId} is now active.`,
      `${process.env.FRONTEND_URL || "http://localhost:5000"}/intent/${intentId}`
    );
  }

  async notifyIntentExecuted(
    userAddress: string, 
    intentTitle: string, 
    result: string,
    transactionHash?: string
  ) {
    const body = `Your intent "${intentTitle}" was successfully executed! ${result}`;
    const cta = transactionHash 
      ? `https://sepolia.etherscan.io/tx/${transactionHash}`
      : undefined;

    return this.sendNotification(
      userAddress,
      "⚡ Intent Executed",
      body,
      cta
    );
  }

  async notifyNFTMinted(
    userAddress: string, 
    tokenId: number, 
    intentTitle: string
  ) {
    return this.sendNotification(
      userAddress,
      "🎉 NFT Minted",
      `Congratulations! NFT #${tokenId} has been minted for your executed intent "${intentTitle}". Check your wallet!`,
      `${process.env.FRONTEND_URL || "http://localhost:5000"}/nfts`
    );
  }

  async notifyIntentExpired(userAddress: string, intentTitle: string, reason: string) {
    return this.sendNotification(
      userAddress,
      "🛑 Intent Expired",
      `Your intent "${intentTitle}" has been cancelled or expired. Reason: ${reason}`,
      `${process.env.FRONTEND_URL || "http://localhost:5000"}/dashboard`
    );
  }

  async notifyIntentFailed(
    userAddress: string, 
    intentTitle: string, 
    errorReason: string
  ) {
    return this.sendNotification(
      userAddress,
      "❌ Intent Failed",
      `Your intent "${intentTitle}" failed to execute. Error: ${errorReason}. Please check your settings.`,
      `${process.env.FRONTEND_URL || "http://localhost:5000"}/dashboard`
    );
  }

  async notifyGasOptimization(userAddress: string, savedAmount: string) {
    return this.sendNotification(
      userAddress,
      "💰 Gas Savings",
      `Great news! Your automation plans have saved you ${savedAmount} ETH in gas fees this month!`
    );
  }

  async notifyConditionMet(
    userAddress: string, 
    intentTitle: string, 
    conditionDescription: string
  ) {
    return this.sendNotification(
      userAddress,
      "🎯 Condition Met",
      `Your intent "${intentTitle}" is ready to execute! Condition met: ${conditionDescription}`,
      `${process.env.FRONTEND_URL || "http://localhost:5000"}/dashboard`
    );
  }
}

export const pushNotificationService = new PushNotificationService();
