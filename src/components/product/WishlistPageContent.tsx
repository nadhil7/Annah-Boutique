"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { WishlistContent } from "@/components/product/WishlistContent";

type ProductsResponse = {
  success: boolean;
  data?: Product[];
  error?: string;
};

export function WishlistPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    // Keep this request same-origin. The catalog base URL may be private or
    // configured as localhost in production, while this page runs in the
    // customer's browser.
    fetch("/api/products?limit=60", { credentials: "same-origin" })
      .then(async (response) => {
        const result = (await response.json()) as ProductsResponse;
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.error || "Failed to load products");
        }
        return result.data;
      })
      .then((items) => { if (active) setProducts(items); })
      .catch(() => { if (active) setError("We could not load your saved pieces right now. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="rounded-xl border border-border p-12 text-center text-muted-foreground">Loading your saved pieces…</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center text-sm text-red-700">{error}<button type="button" onClick={() => window.location.reload()} className="mt-5 block mx-auto rounded-full border border-red-300 px-5 py-2">Try again</button></div>;
  return <WishlistContent products={products} />;
}
