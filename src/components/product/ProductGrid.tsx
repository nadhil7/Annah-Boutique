"use client";

import * as React from "react";
import Link from "next/link";
import { Shirt, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/_shims";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  withPagination?: boolean;
  totalProducts?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export function ProductGrid({
  products,
  withPagination = false,
  totalProducts,
  currentPage = 1,
  pageSize = 24,
  onPageChange,
}: ProductGridProps) {
  const totalPages = totalProducts ? Math.ceil(totalProducts / pageSize) : 0;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
          <Shirt className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-heading-2 font-display font-medium mb-2">
          No products found
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          We couldn&apos;t find any products matching your criteria. Try adjusting your filters or exploring other categories.
        </p>
        <Link href="/shop">
          <Button variant="gold-outline" className="rounded-full px-6">
            Browse All Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          "grid gap-x-4 gap-y-8",
          "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        )}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4}
          />
        ))}
      </div>

      {withPagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-16">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="rounded-full"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1 mx-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - currentPage) <= 1
              )
              .map((page, index, arr) => (
                <React.Fragment key={page}>
                  {index > 0 && arr[index - 1] !== page - 1 && (
                    <span className="px-2 text-muted-foreground text-sm">…</span>
                  )}
                  <Button
                    variant={page === currentPage ? "gold" : "ghost"}
                    size="sm"
                    onClick={() => onPageChange?.(page)}
                    className={cn(
                      "min-w-[2.25rem] rounded-full",
                      page === currentPage ? "text-white" : ""
                    )}
                  >
                    {page}
                  </Button>
                </React.Fragment>
              ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="rounded-full"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
