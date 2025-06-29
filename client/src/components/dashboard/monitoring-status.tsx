
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, CheckCircle, AlertCircle } from "lucide-react";

export function MonitoringStatus() {
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [nextCheck, setNextCheck] = useState<Date>(new Date(Date.now() + 30000));
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate monitoring checks every 30 seconds
      setLastCheck(new Date());
      setNextCheck(new Date(Date.now() + 30000));
    }, 30000);

    // Check if automation is running
    const healthCheck = setInterval(async () => {
      try {
        const response = await fetch('/api/health');
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(healthCheck);
    };
  }, []);

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base">
          <Activity className="mr-2 h-4 w-4 text-green-600" />
          Automation Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">System Status:</span>
          <Badge 
            variant={isOnline ? "secondary" : "destructive"} 
            className={isOnline ? "bg-green-100 text-green-800" : ""}
          >
            {isOnline ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Online
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Last Check:</span>
          <span className="text-sm font-mono">
            {lastCheck.toLocaleTimeString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Next Check:</span>
          <span className="text-sm font-mono text-blue-600">
            {nextCheck.toLocaleTimeString()}
          </span>
        </div>

        <div className="pt-2 border-t">
          <div className="text-xs text-gray-500">
            ✅ Monitoring ETH price conditions<br/>
            ✅ Checking gas prices<br/>
            ✅ Validating wallet balance<br/>
            ⏰ Next automation check in {Math.ceil((nextCheck.getTime() - Date.now()) / 1000)}s
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
