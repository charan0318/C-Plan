import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { SUPPORTED_CHAINS } from "@/types/wallet";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface IntentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  intent: any;
  walletAddress?: string;
}

export function IntentConfirmationModal({
  isOpen,
  onClose,
  intent,
  walletAddress
}: IntentConfirmationModalProps) {
  const [selectedChain, setSelectedChain] = useState("ethereum-sepolia");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createIntentMutation = useMutation({
    mutationFn: async (intentData: any) => {
      const response = await apiRequest("POST", "/api/intents", intentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Intent Created",
        description: "Your automation plan has been saved successfully!",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create intent. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleConfirm = () => {
    if (!intent || !walletAddress) return;

    const intentData = {
      walletAddress,
      title: `${intent.action} ${intent.amount || ""} ${intent.token}`.trim(),
      description: generateDescription(intent),
      action: intent.action,
      token: intent.token,
      amount: intent.amount || null,
      frequency: intent.frequency,
      conditions: intent.conditions || {},
      targetChain: selectedChain,
      isActive: true,
      nextExecution: calculateNextExecution(intent.frequency),
    };

    createIntentMutation.mutate(intentData);
  };

  if (!intent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Intent</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Parsed Intent
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Action:</span>
                <Badge variant="secondary" className="font-mono">
                  {intent.action}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Token:</span>
                <Badge variant="secondary" className="font-mono">
                  {intent.token}
                </Badge>
              </div>
              {intent.amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <Badge variant="secondary" className="font-mono">
                    {intent.amount}
                  </Badge>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                <Badge variant="secondary" className="font-mono">
                  {intent.frequency}
                </Badge>
              </div>
              {intent.conditions && Object.keys(intent.conditions).length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Conditions:</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {JSON.stringify(intent.conditions)}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Chain
            </label>
            <Select value={selectedChain} onValueChange={setSelectedChain}>
              <SelectTrigger>
                <SelectValue placeholder="Select chain" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CHAINS.map((chain) => (
                  <SelectItem key={chain.name} value={chain.name}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: chain.color }}
                      />
                      <span>{chain.displayName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={createIntentMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-primary hover:bg-primary-dark"
            disabled={createIntentMutation.isPending}
          >
            {createIntentMutation.isPending ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : null}
            Confirm & Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateDescription(intent: any): string {
  let description = `${intent.action} ${intent.amount || ""} ${intent.token}`.trim();
  
  if (intent.frequency && intent.frequency !== "CONDITION_BASED") {
    description += ` ${intent.frequency.toLowerCase()}`;
  }
  
  if (intent.conditions && Object.keys(intent.conditions).length > 0) {
    const conditionStrings = Object.entries(intent.conditions).map(([key, value]) => {
      if (key === "gasPrice" && typeof value === "object" && value.max) {
        return `when gas < ${value.max} gwei`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    });
    description += ` ${conditionStrings.join(", ")}`;
  }
  
  return description;
}

function calculateNextExecution(frequency: string): Date {
  const now = new Date();
  
  switch (frequency) {
    case "DAILY":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "WEEKLY":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "MONTHLY":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}
