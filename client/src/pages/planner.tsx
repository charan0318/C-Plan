import { useState } from "react";
import { PlannerChat } from "@/components/chat/planner-chat";
import { IntentConfirmationModal } from "@/components/modals/intent-confirmation-modal";
import { useWallet } from "@/hooks/use-wallet";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Planner() {
  const [showModal, setShowModal] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<any>(null);
  const { isConnected, address } = useWallet();

  const handleIntentConfirmed = (intent: any) => {
    setPendingIntent(intent);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setPendingIntent(null);
  };

  if (!isConnected) {
    return (
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              AI-Powered Planning Chat
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Interact with our ElizaOS agent to create sophisticated wallet automation plans
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex mb-4 gap-2 items-center justify-center">
                <AlertCircle className="h-8 w-8 text-warning" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Wallet Required
                </h2>
              </div>
              <p className="text-center text-gray-600 dark:text-gray-300">
                Please connect your wallet to start planning your automation strategies.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI-Powered Planning Chat
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Interact with our ElizaOS agent to create sophisticated wallet automation plans
          </p>
        </div>
        
        <PlannerChat onIntentConfirmed={handleIntentConfirmed} />
      </div>

      <IntentConfirmationModal
        isOpen={showModal}
        onClose={handleModalClose}
        intent={pendingIntent}
        walletAddress={address}
      />
    </div>
  );
}
