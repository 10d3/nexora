"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <WifiOff className="h-6 w-6 text-destructive" />
            You are offline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Please check your internet connection and try again. Some features may be limited while offline.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="default"
            >
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 