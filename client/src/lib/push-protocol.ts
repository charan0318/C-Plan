
import * as PushAPI from "@pushprotocol/restapi";
import { ethers } from "ethers";

export class ClientPushService {
  private channelAddress: string;
  private env: "prod" | "staging" = "staging";

  constructor(channelAddress: string) {
    this.channelAddress = channelAddress;
  }

  async subscribeToChannel(userSigner: ethers.Signer) {
    try {
      await PushAPI.channels.subscribe({
        signer: userSigner,
        channelAddress: `eip155:11155111:${this.channelAddress}`,
        userAddress: await userSigner.getAddress(),
        onSuccess: () => {
          console.log("✅ Successfully subscribed to Push notifications");
        },
        onError: (error: any) => {
          console.error("❌ Failed to subscribe:", error);
        },
        env: this.env
      });
      return true;
    } catch (error) {
      console.error("Subscribe error:", error);
      return false;
    }
  }

  async unsubscribeFromChannel(userSigner: ethers.Signer) {
    try {
      await PushAPI.channels.unsubscribe({
        signer: userSigner,
        channelAddress: `eip155:11155111:${this.channelAddress}`,
        userAddress: await userSigner.getAddress(),
        onSuccess: () => {
          console.log("✅ Successfully unsubscribed from Push notifications");
        },
        onError: (error: any) => {
          console.error("❌ Failed to unsubscribe:", error);
        },
        env: this.env
      });
      return true;
    } catch (error) {
      console.error("Unsubscribe error:", error);
      return false;
    }
  }

  async getSubscriptionStatus(userAddress: string) {
    try {
      const subscriptions = await PushAPI.user.getSubscriptions({
        user: `eip155:11155111:${userAddress}`,
        env: this.env
      });

      const isSubscribed = subscriptions.some(
        (sub: any) => sub.channel.toLowerCase() === this.channelAddress.toLowerCase()
      );

      return isSubscribed;
    } catch (error) {
      console.error("Get subscription status error:", error);
      return false;
    }
  }

  async getNotifications(userAddress: string, page = 1, limit = 10) {
    try {
      const notifications = await PushAPI.user.getFeeds({
        user: `eip155:11155111:${userAddress}`,
        page: page,
        limit: limit,
        env: this.env
      });

      return notifications;
    } catch (error) {
      console.error("Get notifications error:", error);
      return [];
    }
  }
}

// Initialize with your channel address
export const clientPushService = new ClientPushService(
  process.env.VITE_PUSH_CHANNEL_ADDRESS || "0x742d35Cc6639Cf532793a3f8a12345678901234"
);
