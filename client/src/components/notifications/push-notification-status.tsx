
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationStatus {
  isConnected: boolean;
  isSubscribed: boolean;
  channelAddress?: string;
}

export function PushNotificationStatus() {
  const [status, setStatus] = useState<NotificationStatus>({
    isConnected: false,
    isSubscribed: false
  });

  useEffect(() => {
    checkPushStatus();
  }, []);

  const checkPushStatus = async () => {
    try {
      // In a real implementation, you would check if the user is subscribed to your Push channel
      // For demo purposes, we'll simulate this
      setStatus({
        isConnected: true,
        isSubscribed: Math.random() > 0.5, // Simulate 50% chance of being subscribed
        channelAddress: "0x742d35Cc6639Cf532793a3f8a12345678901234"
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        isSubscribed: false
      });
    }
  };

  const handleSubscribe = async () => {
    try {
      // In a real implementation, you would use Push SDK to subscribe to the channel
      console.log("Subscribing to Push notifications...");
      setStatus(prev => ({ ...prev, isSubscribed: true }));
    } catch (error) {
      console.error("Failed to subscribe to notifications:", error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      // In a real implementation, you would use Push SDK to unsubscribe from the channel
      console.log("Unsubscribing from Push notifications...");
      setStatus(prev => ({ ...prev, isSubscribed: false }));
    } catch (error) {
      console.error("Failed to unsubscribe from notifications:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Push Notifications</CardTitle>
          <CardDescription>
            Get notified when your intents execute
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {status.isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          {status.isSubscribed ? (
            <Bell className="h-4 w-4 text-blue-500" />
          ) : (
            <BellOff className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Badge variant={status.isConnected ? "default" : "destructive"}>
                {status.isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <Badge variant={status.isSubscribed ? "default" : "secondary"}>
                {status.isSubscribed ? "Subscribed" : "Not Subscribed"}
              </Badge>
            </div>
            {status.channelAddress && (
              <p className="text-xs text-gray-500">
                Channel: {status.channelAddress.slice(0, 8)}...
              </p>
            )}
          </div>
          
          {status.isConnected && (
            <Button
              size="sm"
              variant={status.isSubscribed ? "outline" : "default"}
              onClick={status.isSubscribed ? handleUnsubscribe : handleSubscribe}
            >
              {status.isSubscribed ? "Unsubscribe" : "Subscribe"}
            </Button>
          )}
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          <p>Notifications for:</p>
          <ul className="mt-1 space-y-1">
            <li>• Intent creation ✅</li>
            <li>• Intent execution ⚡</li>
            <li>• NFT minting 🎉</li>
            <li>• Intent expiration 🛑</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
