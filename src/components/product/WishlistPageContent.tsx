"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { fetchProducts } from "@/lib/catalogApi";
import { WishlistContent } from "@/components/product/WishlistContent";

export function WishlistPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchProducts({ limit: 60 })
      .then((result) => { if (active) setProducts(result.items); })
      .catch(() => { if (active) setError("We could not load your saved pieces right now. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="rounded-xl border border-border p-12 text-center text-muted-foreground">Loading your saved pieces…</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center text-sm text-red-700">{error}<button type="button" onClick={() => window.location.reload()} className="mt-5 block mx-auto rounded-full border border-red-300 px-5 py-2">Try again</button></div>;
  return <WishlistContent products={products} />;
}
