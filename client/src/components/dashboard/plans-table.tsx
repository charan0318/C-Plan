
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Eye, Pause, Play, Trash2, Coins, Send, Bell, ArrowRightLeft, Zap, Loader2 } from "lucide-react";
import { format } from "date-fns";

export function PlansTable() {
  const [executingId, setExecutingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: intents = [], isLoading } = useQuery({
    queryKey: ["/api/intents"],
    queryFn: async () => {
      const response = await fetch("/api/intents");
      if (!response.ok) throw new Error("Failed to fetch intents");
      return response.json();
    }
  });

  const executeIntentMutation = useMutation({
    mutationFn: async (intentId: number) => {
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
      setExecutingId(null);
    }
  });

  const updateIntentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await fetch(`/api/intents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error("Failed to update intent");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setUpdatingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update intent",
        variant: "destructive"
      });
      setUpdatingId(null);
    }
  });

  const deleteIntentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/intents/${id}`, {
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
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete intent",
        variant: "destructive"
      });
    }
  });

  const handleExecuteIntent = async (intentId: number) => {
    setExecutingId(intentId);
    try {
      await executeIntentMutation.mutateAsync(intentId);
    } catch (error) {
      console.error("Failed to execute intent:", error);
    }
  };

  const handleToggleActive = (intent: any) => {
    setUpdatingId(intent.id);
    updateIntentMutation.mutate({
      id: intent.id,
      updates: { isActive: !intent.isActive }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this automation plan?")) {
      deleteIntentMutation.mutate(id);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "SEND":
        return <Send className="text-blue-600" size={16} />;
      case "REMIND":
        return <Bell className="text-yellow-600" size={16} />;
      case "SWAP":
        return <ArrowRightLeft className="text-purple-600" size={16} />;
      default:
        return <Coins className="text-gray-500" size={16} />;
    }
  };

  const getStatusBadge = (isActive: boolean, lastExecution?: string) => {
    if (!isActive) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          <div className="w-2 h-2 bg-gray-400 rounded-full mr-1" />
          Paused
        </Badge>
      );
    }

    if (lastExecution) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <div className="w-2 h-2 bg-green-600 rounded-full mr-1" />
          Active
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
        <div className="w-2 h-2 bg-orange-600 rounded-full mr-1" />
        Pending
      </Badge>
    );
  };

  const getResultBadge = (lastExecution?: string) => {
    if (!lastExecution) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          <div className="w-2 h-2 bg-gray-400 rounded-full mr-1" />
          Waiting
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        <div className="w-2 h-2 bg-green-600 rounded-full mr-1" />
        Success
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (intents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No automation plans yet. Start by creating your first plan!
        </p>
        <Link href="/planner">
          <Button className="bg-primary hover:bg-primary/90">
            Create Your First Plan
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next Run</TableHead>
            <TableHead>Last Result</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {intents.map((intent: any) => (
            <TableRow key={intent.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getActionIcon(intent.action)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {intent.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {intent.description}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(intent.isActive, intent.lastExecution)}
              </TableCell>
              <TableCell>
                {intent.nextExecution ? (
                  <div>
                    <div className="font-mono text-sm">
                      {format(new Date(intent.nextExecution), "MMM dd, yyyy")}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {format(new Date(intent.nextExecution), "h:mm a")}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell>
                {getResultBadge(intent.lastExecution)}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleExecuteIntent(intent.id)}
                    disabled={executingId === intent.id || executeIntentMutation.isPending}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    title="Execute Intent"
                  >
                    {executingId === intent.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap size={16} />
                    )}
                  </Button>
                  <Link href={`/intent/${intent.id}`}>
                    <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Eye size={16} />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(intent)}
                    disabled={updatingId === intent.id}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    {intent.isActive ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(intent.id)}
                    disabled={deleteIntentMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
