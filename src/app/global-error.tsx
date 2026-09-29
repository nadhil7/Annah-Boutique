"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en-IN">
      <body className="min-h-screen flex items-center justify-center bg-cream px-4 font-sans antialiased">
        <div className="max-w-md w-full bg-background border border-border rounded-lg shadow-premium p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>

          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
            Unexpected Error
          </h2>

          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            The application encountered a critical error. Please refresh the
            page to continue.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 border border-gold text-gold hover:bg-gold hover:text-white transition-colors text-sm font-medium"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-hover transition-colors text-sm font-medium"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
