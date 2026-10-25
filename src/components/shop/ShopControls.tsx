"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { fetchCategories, fetchFilterOptions } from "@/lib/catalogApi";

export function ShopControls() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colours, setColours] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchFilterOptions()]).then(([categoryRows, options]) => {
      setCategories(categoryRows);
      setSizes(options.sizes);
      setColours(options.colors);
    }).catch(() => { setCategories([]); setSizes([]); setColours([]); });
  }, []);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    router.push(`${path}${next.toString() ? `?${next.toString()}` : ""}`, { scroll: false });
  };

  const updatePrice = (value: string) => {
    const next = new URLSearchParams(params.toString());
    next.delete("price"); next.delete("minPrice"); next.delete("maxPrice");
    if (value === "under-2000") next.set("maxPrice", "1999");
    if (value === "2000-5000") { next.set("minPrice", "2000"); next.set("maxPrice", "5000"); }
    if (value === "over-5000") next.set("minPrice", "5001");
    next.delete("page");
    router.push(`${path}${next.toString() ? `?${next.toString()}` : ""}`, { scroll: false });
  };

  return <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
    <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 text-sm lg:hidden" aria-expanded={open}><Filter size={16} /> Filters</button>
    <div className={`${open ? "flex" : "hidden"} w-full flex-wrap gap-2 lg:flex lg:w-auto`}>
      <select aria-label="Category" value={params.get("category") ?? ""} onChange={(event) => update("category", event.target.value)} className="rounded-full border border-border bg-transparent px-4 py-2 text-sm"><option value="">All categories</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select>
      <select aria-label="Size" value={params.get("size") ?? ""} onChange={(event) => update("size", event.target.value)} className="rounded-full border border-border bg-transparent px-4 py-2 text-sm"><option value="">All sizes</option>{sizes.map((size) => <option key={size} value={size}>{size}</option>)}</select>
      <select aria-label="Colour" value={params.get("colour") ?? ""} onChange={(event) => update("colour", event.target.value)} className="rounded-full border border-border bg-transparent px-4 py-2 text-sm"><option value="">All colours</option>{colours.map((colour) => <option key={colour} value={colour}>{colour}</option>)}</select>
      <select aria-label="Price range" value={params.get("price") ?? ""} onChange={(event) => updatePrice(event.target.value)} className="rounded-full border border-border bg-transparent px-4 py-2 text-sm"><option value="">Any price</option><option value="under-2000">Under ₹2,000</option><option value="2000-5000">₹2,000–₹5,000</option><option value="over-5000">₹5,000+</option></select>
      <select aria-label="Availability" value={params.get("availability") ?? ""} onChange={(event) => update("availability", event.target.value)} className="rounded-full border border-border bg-transparent px-4 py-2 text-sm"><option value="">Availability</option><option value="AVAILABLE">Available</option></select>
    </div>
    <label className="ml-auto inline-flex items-center gap-2 text-sm"><SlidersHorizontal size={15} /><span className="sr-only">Sort products</span><select aria-label="Sort products" value={params.get("sort") ?? "newest"} onChange={(event) => update("sort", event.target.value)} className="bg-transparent outline-none"><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="featured">Featured</option></select></label>
  </div>;
}
