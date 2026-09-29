"use client";
import type { Product } from "@/types/product";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useWishlistStore } from "@/stores/wishlistStore";
export function WishlistContent({products}:{products:Product[]}){const ids=useWishlistStore(s=>s.items.map(x=>x.productId));const saved=products.filter(p=>ids.includes(p.id));return saved.length?<ProductGrid products={saved}/>:<div className="rounded-xl border border-border p-12 text-center"><h2 className="font-display text-3xl">Your saved pieces will be here</h2><p className="mt-2 text-muted-foreground">Tap the heart on a piece you love.</p><a href="/shop" className="mt-6 inline-block rounded-full bg-[#392a25] px-6 py-3 text-sm text-white">Explore the collection</a></div>;}
