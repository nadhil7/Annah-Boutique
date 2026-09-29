"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-cream/50">
      <Card className="max-w-md w-full bg-background shadow-premium border-border">
        <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>

          <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
            Something went wrong
          </h2>

          <div className="gold-underline my-3" />

          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            We apologize for the inconvenience. An unexpected error has occurred
            while processing your request. Please try again, or return to the
            home page.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={reset}
              variant="gold-outline"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
            <Button asChild variant="default" className="flex-1">
              <Link href="/">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
