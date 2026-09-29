"use client";

import * as React from "react";
import { Heart, MessageCircle, ShoppingBag, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { useWishlistStore } from "@/stores/wishlistStore";

interface PdpCtaBlockProps {
  productId: string;
  productName: string;
  productSlug: string;
  productUrl?: string;
  inStock?: boolean;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export function PdpCtaBlock({
  productId,
  productName,
  productSlug,
  productUrl,
  inStock = true,
  onAddToCart,
  onBuyNow,
}: PdpCtaBlockProps) {
  const isWished = useWishlistStore((s) => s.items.some((item) => item.productId === productId));
  const toggle = useWishlistStore((s) => s.toggle);

  const handleWishlistToggle = () => {
    toggle(productId);
  };

  // Keep server and client markup identical during hydration. Configure the
  // production canonical origin in siteConfig.url.
  const fullProductUrl =
    productUrl ?? `${siteConfig.url}/product/${productSlug}`;

  const whatsappMessage = encodeURIComponent(
    `Hi ${siteConfig.name}, I'm interested in "${productName}" — ${fullProductUrl}`
  );
  const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${whatsappMessage}`;

  return (
    <>
      <div className="hidden lg:flex flex-col gap-3 w-full">
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl border transition-all duration-200 font-medium text-sm",
            isWished
              ? "border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/5 text-[hsl(var(--primary))]"
              : "border-border text-foreground hover:border-[hsl(var(--primary))]/30 hover:bg-muted/30"
          )}
        >
          <Heart
            className={cn(
              "w-4 h-4",
              isWished && "fill-[hsl(var(--primary))] animate-heart-pop"
            )}
          />
          {isWished ? "Saved to Wishlist" : "Add to Wishlist"}
        </button>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={!inStock}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl transition-all duration-200 font-semibold text-sm",
            "bg-gold text-white hover:bg-gold/90 shadow-soft hover:shadow-premium hover:-translate-y-0.5",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          )}
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Cart
        </button>

        <button
          type="button"
          onClick={onBuyNow}
          disabled={!inStock}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl transition-all duration-200 font-semibold text-sm",
            "bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] shadow-soft hover:shadow-premium hover:-translate-y-0.5",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          )}
        >
          <Zap className="w-4 h-4" />
          Buy Now
        </button>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl transition-all duration-200 font-semibold text-sm",
            "bg-[#25D366] text-white hover:bg-[#22c55e] shadow-soft hover:-translate-y-0.5"
          )}
        >
          <MessageCircle className="w-4 h-4" />
          Enquire on WhatsApp
        </a>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur border-t border-border p-3">
        <div className="grid grid-cols-[40px_1fr_1fr] gap-2 items-center max-w-md mx-auto">
          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "h-11 w-11 rounded-xl border flex items-center justify-center transition-all duration-200",
              isWished
                ? "border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/5 text-[hsl(var(--primary))]"
                : "border-border text-foreground"
            )}
          >
            <Heart
              className={cn(
                "w-5 h-5",
                isWished && "fill-[hsl(var(--primary))] animate-heart-pop"
              )}
            />
          </button>

          <button
            type="button"
            onClick={onAddToCart}
            disabled={!inStock}
            className={cn(
              "h-12 rounded-xl font-semibold text-sm text-white transition-all duration-200",
              "bg-gold hover:bg-gold/90",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            Add to Cart
          </button>

          <button
            type="button"
            onClick={onBuyNow}
            disabled={!inStock}
            className={cn(
              "h-12 rounded-xl font-semibold text-sm text-white transition-all duration-200",
              "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))]",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            Buy Now
          </button>
        </div>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="max-w-md mx-auto mt-2 w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366] text-white font-medium text-sm hover:bg-[#22c55e] transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Enquire on WhatsApp
        </a>
      </div>
    </>
  );
}
