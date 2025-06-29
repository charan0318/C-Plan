
import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Trash2, 
  Clock, 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

export default function IntentDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExecuting, setIsExecuting] = useState(false);

  const intentId = parseInt(params.id || "0");

  const { data: intent, isLoading, error } = useQuery({
    queryKey: [`/api/intents/${intentId}`],
    queryFn: async () => {
      const response = await fetch(`/api/intents/${intentId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Intent not found");
        }
        throw new Error("Failed to fetch intent");
      }
      return response.json();
    },
    enabled: !!intentId && intentId > 0,
  });

  const executeIntentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/intents/${intentId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to execute intent");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/intents/${intentId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/intents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nfts"] });
      
      if (data.success && data.executed) {
        toast({
          title: "Intent Executed Successfully! 🎉",
          description: data.message || "Your automation completed successfully",
          duration: 5000,
        });
      } else if (data.success === false) {
        toast({
          title: "Execution Conditions Not Met",
          description: data.message || "Waiting for execution conditions to be satisfied",
          variant: "default",
          duration: 4000,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Execution Failed ❌",
        description: error.message || "Failed to execute intent",
        variant: "destructive",
        duration: 6000,
      });
    },
    onSettled: () => {
      setIsExecuting(false);
    }
  });

  const updateIntentMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await fetch(`/api/intents/${intentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error("Failed to update intent");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/intents/${intentId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/intents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Intent Updated",
        description: "Automation plan has been updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update intent",
        variant: "destructive"
      });
    }
  });

  const deleteIntentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/intents/${intentId}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete intent");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Intent Deleted",
        description: "Automation plan has been deleted",
      });
      setLocation("/dashboard");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete intent",
        variant: "destructive"
      });
    }
  });

  const handleExecuteIntent = async () => {
    setIsExecuting(true);
    try {
      await executeIntentMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to execute intent:", error);
    }
  };

  const handleToggleActive = () => {
    updateIntentMutation.mutate({
      isActive: !intent.isActive
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this automation plan?")) {
      deleteIntentMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !intent) {
    return (
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Intent Not Found
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  The automation plan you're looking for doesn't exist or has been deleted.
                </p>
                <Link href="/dashboard">
                  <Button>Back to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {intent.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {intent.description}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleExecuteIntent}
              disabled={isExecuting || executeIntentMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isExecuting || executeIntentMutation.isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Zap size={16} className="mr-2" />
                  Execute Now
                </>
              )}
            </Button>
            <Button
              onClick={handleToggleActive}
              variant="outline"
              disabled={updateIntentMutation.isPending}
              className={intent.isActive ? "text-orange-600" : "text-green-600"}
            >
              {intent.isActive ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
              {intent.isActive ? "Pause" : "Resume"}
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              disabled={deleteIntentMutation.isPending}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Intent Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Intent Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Action</label>
                <p className="text-lg font-semibold">{intent.action}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Token</label>
                <p className="text-lg font-semibold">{intent.token}</p>
              </div>
              {intent.amount && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-lg font-semibold">{intent.amount}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Frequency</label>
                <p className="text-lg font-semibold">{intent.frequency || "Once"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  {intent.isActive ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle size={14} className="mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Pause size={14} className="mr-1" />
                      Paused
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Execution Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-lg font-semibold">
                  {format(new Date(intent.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
              {intent.lastExecution && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Execution</label>
                  <p className="text-lg font-semibold">
                    {format(new Date(intent.lastExecution), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}
              {intent.nextExecution && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Next Execution</label>
                  <p className="text-lg font-semibold">
                    {format(new Date(intent.nextExecution), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Target Chain</label>
                <p className="text-lg font-semibold">Sepolia Testnet</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Execution History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Execution History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {intent.executionHistory && intent.executionHistory.length > 0 ? (
              <div className="space-y-4">
                {intent.executionHistory.map((execution: any) => (
                  <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {execution.status === "SUCCESS" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : execution.status === "FAILED" ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium">{execution.result}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(execution.executedAt), "MMM dd, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={execution.status === "SUCCESS" ? "default" : "destructive"}
                      >
                        {execution.status}
                      </Badge>
                      {execution.transactionHash && (
                        <p className="text-xs text-gray-500 mt-1">
                          TX: {execution.transactionHash.substring(0, 10)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No execution history yet. Execute this intent to see results here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
