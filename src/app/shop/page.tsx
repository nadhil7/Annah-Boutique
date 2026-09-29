import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { queryProducts } from "@/services/productService";
import { ShopControls } from "@/components/shop/ShopControls";

export const metadata: Metadata = { title: "Shop the Collection", description: "Explore thoughtfully curated Indian wear from Annah Boutique." };
type Params = Record<string, string | string[] | undefined>;
export default async function ShopPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : v;
  const csv = (value: string | string[] | undefined) => (Array.isArray(value) ? value.join(",") : value ?? "").split(",").filter(Boolean);
  const result = await queryProducts({ category: csv(params.category)[0], collection: csv(params.collection)[0], q: one(params.q), sizes: csv(params.size ?? params.sizes), colors: csv(params.color ?? params.colors), priceMin: Number(one(params.minPrice ?? params.priceMin) ?? 0) || undefined, priceMax: Number(one(params.maxPrice ?? params.priceMax) ?? 0) || undefined, minDiscount: Number(one(params.discount) ?? 0) || undefined, inStockOnly: one(params.availability) === "in-stock" || one(params.inStock) === "true", sort: (one(params.sort) as never) ?? "featured", page: Number(one(params.page) ?? 1), limit: 24 });
  return <div className="container-editorial py-10 md:py-16"><p className="text-xs uppercase tracking-[.24em] text-primary">Annah Boutique / Shop</p><h1 className="mt-3 font-display text-4xl md:text-5xl">Find your next favourite</h1><p className="mt-3 text-muted-foreground">{result.total} pieces, chosen with care</p><ShopControls /><div className="mt-7"><ProductGrid products={result.items} /></div></div>;
}
