import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { EXAMPLE_PROMPTS } from "@/lib/agents";
import { Send, Bot, User, Brain } from "lucide-react";
import type { ChatMessage } from "@/types/intent";

interface PlannerChatProps {
  onIntentConfirmed?: (intent: any) => void;
}

export function PlannerChat({ onIntentConfirmed }: PlannerChatProps) {
  const [message, setMessage] = useState("");
  const [pendingIntent, setPendingIntent] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat history
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/history"],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        message: messageText
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
      
      // Check if agent response contains a parsed intent
      if (data.agentResponse) {
        setPendingIntent(data.agentResponse);
      }
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate(message);
    setMessage("");
  };

  const handleExamplePrompt = (prompt: string) => {
    setMessage(prompt);
  };

  const handleConfirmIntent = () => {
    if (pendingIntent && onIntentConfirmed) {
      onIntentConfirmed(pendingIntent);
      setPendingIntent(null);
    }
  };

  const handleRetry = () => {
    setPendingIntent(null);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Chat Interface */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="h-96 overflow-y-auto mb-4 space-y-4">
            {/* Initial agent message */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Brain size={16} className="text-white" />
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 max-w-md">
                <p className="text-gray-900 dark:text-gray-100">
                  Hello! I'm your wallet planning assistant. What would you like to automate today?
                </p>
              </div>
            </div>

            {/* Chat messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  msg.isAgent ? "" : "justify-end"
                }`}
              >
                {msg.isAgent ? (
                  <>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 max-w-md">
                      <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {msg.message}
                      </div>
                      {msg.agentResponse && (
                        <div className="mt-3 bg-gray-50 dark:bg-gray-600 p-3 rounded-lg font-mono text-sm">
                          <div className="text-gray-600 dark:text-gray-300">
                            Action: <span className="text-primary">{msg.agentResponse.action}</span>
                          </div>
                          <div className="text-gray-600 dark:text-gray-300">
                            Token: <span className="text-primary">{msg.agentResponse.token}</span>
                          </div>
                          {msg.agentResponse.amount && (
                            <div className="text-gray-600 dark:text-gray-300">
                              Amount: <span className="text-primary">{msg.agentResponse.amount}</span>
                            </div>
                          )}
                          <div className="text-gray-600 dark:text-gray-300">
                            Frequency: <span className="text-primary">{msg.agentResponse.frequency}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-primary text-white p-4 rounded-lg shadow-sm max-w-md">
                      <p>{msg.message}</p>
                    </div>
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User size={16} className="text-gray-600 dark:text-gray-300" />
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Pending intent confirmation */}
            {pendingIntent && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 max-w-md">
                  <p className="text-gray-900 dark:text-gray-100 mb-3">
                    Perfect! I've parsed your request. Ready to proceed?
                  </p>
                  <div className="flex space-x-2">
                    <Button onClick={handleConfirmIntent} size="sm" className="bg-accent hover:bg-accent/90">
                      Confirm & Continue
                    </Button>
                    <Button onClick={handleRetry} variant="outline" size="sm">
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <div className="flex space-x-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your wallet automation goal..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-primary hover:bg-primary-dark"
            >
              <Send size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Example Prompts */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Try these examples:
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {EXAMPLE_PROMPTS.map((prompt, index) => (
            <Button
              key={index}
              onClick={() => handleExamplePrompt(prompt)}
              variant="outline"
              className="text-left p-4 h-auto justify-start"
            >
              <Badge variant="secondary" className="mr-2 text-primary">
                {index + 1}
              </Badge>
              {prompt}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
