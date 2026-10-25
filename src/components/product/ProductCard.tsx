"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import type { Product } from "@/types/product";
import { formatINR, cn } from "@/lib/utils";
import { ProductBadges } from "./ProductBadges";
import { useWishlistStore } from "@/stores/wishlistStore";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  showSecondaryHover?: boolean;
}

export function ProductCard({
  product,
  priority = false,
  showSecondaryHover = true,
}: ProductCardProps) {
  const isWished = useWishlistStore((s) => s.items.some((item) => item.productId === product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const hasDiscount = product.discount > 0 && product.originalPrice > product.price;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group/productcard relative block w-full transition-all duration-300 hover:-translate-y-1"
      )}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-card group-hover:shadow-premium transition-shadow duration-300">
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-3 right-3 z-20 rounded-full bg-white/80 backdrop-blur p-2 transition-all duration-200",
            "group-hover:opacity-100 opacity-70",
            "hover:bg-white hover:scale-110",
            isWished && "animate-heart-pop"
          )}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              isWished
                ? "fill-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                : "text-foreground group-hover:text-[hsl(var(--primary))]"
            )}
          />
        </button>

        <div className="relative aspect-[3/4] bg-secondary overflow-hidden rounded-2xl">
          <Image
            src={product.images[0] || "/placeholder-product.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={priority}
          />

          {showSecondaryHover && product.images[1] && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out">
              <Image
                src={product.images[1]}
                alt={`${product.name} alternate view`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="w-full h-full object-cover"
                priority={false}
              />
            </div>
          )}

          <ProductBadges
            isNew={product.isNew}
            isTrending={product.isTrending}
            isBestseller={product.isBestseller}
            discount={product.discount}
          />
        </div>

        <div className="p-3 space-y-1.5">
          <h3 className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-baseline flex-wrap gap-x-2">
            <span className="text-base font-semibold text-[hsl(var(--primary))]">
              {formatINR(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  {formatINR(product.originalPrice)}
                </span>
                <span className="text-xs text-success font-medium">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          {product.reviewCount > 0 && <div className="flex items-center gap-1 pt-0.5"><Star className="w-3 h-3 fill-gold text-gold" /><span className="text-xs text-muted-foreground">{product.rating.toFixed(1)} ({product.reviewCount})</span></div>}
        </div>
      </div>
    </Link>
  );
}
