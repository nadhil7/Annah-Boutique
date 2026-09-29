"use client";

import * as React from "react";
import { Send, Sparkles } from "lucide-react";
import { Button, Input, toast } from "@/components/ui/_shims";
import { cn } from "@/lib/utils";

export function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      toast("You're on the list! Check your inbox for a welcome gift.");
      setEmail("");
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <section className="container-editorial mx-auto py-16 px-4 sm:px-6">
      <div
        className={cn(
          "relative overflow-hidden",
          "rounded-3xl border border-border py-14 px-6 md:px-14 text-center my-12",
          "bg-[hsl(var(--primary))]/5 shadow-card"
        )}
      >
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-16 w-80 h-80 rounded-full bg-[hsl(var(--primary))]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center mb-5">
            <Sparkles className="w-6 h-6 text-gold" />
          </div>

          <p className="text-gold text-xs md:text-sm uppercase tracking-[0.25em] font-semibold mb-3">
            The Annah Circle
          </p>

          <h2 className="font-display font-medium tracking-tight text-heading-1 text-foreground leading-tight mb-3 max-w-2xl">
            Join the Annah Circle
          </h2>

          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Be the first to know about new collections, private sales,
            exclusive styling tips, and members-only launches — straight to your inbox.
          </p>

          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col md:flex-row max-w-xl mx-auto gap-2 md:gap-3 mt-1"
          >
            <div className="flex-1 relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="h-12 md:h-14 pl-5 pr-5 rounded-full bg-background text-base border-border focus:ring-2 focus:ring-gold/30 focus:border-gold/50"
              />
            </div>
            <Button
              type="submit"
              variant="gold"
              size="lg"
              disabled={isSubmitting}
              className="h-12 md:h-14 rounded-full px-6 md:px-8 text-white font-semibold shadow-soft hover:shadow-premium transition-all duration-300 text-base"
            >
              {isSubmitting ? (
                "Subscribing..."
              ) : (
                <>
                  Subscribe
                  <Send className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-5 opacity-80">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
