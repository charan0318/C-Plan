import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pause, Play, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import type { IntentWithHistory } from "@/types/intent";

export default function IntentDetails() {
  const params = useParams();
  const intentId = params.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: intent, isLoading, error } = useQuery<IntentWithHistory>({
    queryKey: ["/api/intents", intentId],
    enabled: !!intentId,
  });

  const updateIntentMutation = useMutation({
    mutationFn: async (updates: Partial<IntentWithHistory>) => {
      const response = await apiRequest("PATCH", `/api/intents/${intentId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intents", intentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/intents"] });
      toast({
        title: "Intent Updated",
        description: "Your automation plan has been updated successfully!",
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
      const response = await apiRequest("DELETE", `/api/intents/${intentId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Intent Deleted",
        description: "Automation plan has been deleted",
      });
      // Redirect to dashboard
      window.location.href = "/dashboard";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete intent",
        variant: "destructive"
      });
    }
  });

  const handleToggleActive = () => {
    if (intent) {
      updateIntentMutation.mutate({ isActive: !intent.isActive });
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this automation plan?")) {
      deleteIntentMutation.mutate();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="text-green-600" size={16} />;
      case "FAILED":
        return <XCircle className="text-red-600" size={16} />;
      case "PENDING":
        return <Clock className="text-warning" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Success
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Failed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning">
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
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
              onClick={handleToggleActive}
              variant="outline"
              disabled={updateIntentMutation.isPending}
              className={intent.isActive ? "text-warning" : "text-accent"}
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

        <div className="space-y-6">
          {/* Intent Details */}
          <Card>
            <CardHeader>
              <CardTitle>Intent Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Action
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {intent.action}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Token
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {intent.token}
                    </p>
                  </div>
                  {intent.amount && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Amount
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {intent.amount}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Frequency
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {intent.frequency}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Target Chain
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {intent.targetChain}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </label>
                    <div className="mt-1">
                      {intent.isActive ? (
                        <Badge variant="secondary" className="bg-accent/10 text-accent">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          Paused
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Next Execution
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {intent.nextExecution 
                        ? format(new Date(intent.nextExecution), "MMM dd, yyyy 'at' h:mm a")
                        : "Not scheduled"
                      }
                    </p>
                  </div>
                  {Object.keys(intent.conditions).length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Conditions
                      </label>
                      <pre className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded-lg mt-1 font-mono">
                        {JSON.stringify(intent.conditions, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execution History */}
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
            </CardHeader>
            <CardContent>
              {intent.executionHistory && intent.executionHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Gas Used</TableHead>
                        <TableHead>Transaction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {intent.executionHistory.map((execution) => (
                        <TableRow key={execution.id}>
                          <TableCell>
                            <div>
                              <div className="font-semibold">
                                {format(new Date(execution.executedAt), "MMM dd, yyyy")}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(new Date(execution.executedAt), "h:mm a")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(execution.status)}
                              {getStatusBadge(execution.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {execution.result || "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">
                              {execution.gasUsed || "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {execution.transactionHash ? (
                              <a
                                href={`https://sepolia.etherscan.io/tx/${execution.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-sm text-primary hover:underline"
                              >
                                {execution.transactionHash.slice(0, 10)}...
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No executions yet. Your automation plan will appear here once it starts running.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
