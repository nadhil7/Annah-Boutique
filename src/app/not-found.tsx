import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-cream/50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-gold" />
      </div>

      <div className="relative z-10 max-w-xl w-full text-center">
        <h1 className="font-display text-[clamp(6rem,18vw,12rem)] font-light leading-none text-foreground/10 mb-0 select-none">
          404
        </h1>

        <div className="relative -mt-16">
          <div className="gold-underline my-6" />

          <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-3">
            This piece couldn&apos;t be found.
          </h2>

          <p className="text-muted-foreground mb-10 leading-relaxed max-w-md mx-auto">
            The page you&apos;re looking for may have been moved, discontinued,
            or perhaps never existed. Let us help you discover something
            beautiful instead.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default" size="lg">
              <Link href="/">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="gold-outline" size="lg">
              <Link href="/shop">
                <ShoppingBag className="w-4 h-4" />
                Browse Shop
              </Link>
            </Button>
          </div>

          <div className="mt-12">
            <p className="font-script text-xl text-gold">
              — Every piece tells a story —
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
