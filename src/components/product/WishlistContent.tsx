"use client";
import { useMemo } from "react";
import type { Product } from "@/types/product";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useWishlistStore } from "@/stores/wishlistStore";
export function WishlistContent({products}:{products:Product[]}){const items=useWishlistStore(s=>s.items);const ids=useMemo(()=>new Set(items.map(x=>x.productId)),[items]);const saved=products.filter(p=>ids.has(p.id));return saved.length?<ProductGrid products={saved}/>:<div className="rounded-xl border border-border p-12 text-center"><h2 className="font-display text-3xl">Your saved pieces will be here</h2><p className="mt-2 text-muted-foreground">Tap the heart on a piece you love.</p><a href="/shop" className="mt-6 inline-block rounded-full bg-[#392a25] px-6 py-3 text-sm text-white">Explore the collection</a></div>;}
