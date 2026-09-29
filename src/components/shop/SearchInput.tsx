"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Tag, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/_shims";
import type { Product } from "@/types/_shims";

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "rose-gold-kurti",
    name: "Rose Gold Embroidered Kurti",
    description: "",
    price: 2499,
    originalPrice: 3499,
    discount: 29,
    category: "kurtis",
    collection: "festive-edit",
    images: [],
    colors: ["pink", "gold"],
    sizes: ["S", "M", "L", "XL"],
    stock: 15,
    rating: 4.8,
    reviewCount: 124,
    isNew: true,
    isFeatured: false,
    isTrending: true,
    isBestseller: false,
    tags: [],
    createdAt: new Date(),
  },
  {
    id: "2",
    slug: "banarasi-silk-saree",
    name: "Banarasi Silk Saree - Maroon",
    description: "",
    price: 7999,
    originalPrice: 9999,
    discount: 20,
    category: "sarees",
    collection: "festive-edit",
    images: [],
    colors: ["maroon", "gold"],
    sizes: ["Free Size"],
    stock: 8,
    rating: 4.9,
    reviewCount: 256,
    isNew: false,
    isFeatured: true,
    isTrending: false,
    isBestseller: true,
    tags: [],
    createdAt: new Date(),
  },
  {
    id: "3",
    slug: "pastel-coord-set",
    name: "Pastel Mint Co-ord Set",
    description: "",
    price: 3299,
    originalPrice: 4299,
    discount: 23,
    category: "co-ord-sets",
    collection: "summer-edit",
    images: [],
    colors: ["green", "beige"],
    sizes: ["S", "M", "L"],
    stock: 12,
    rating: 4.7,
    reviewCount: 89,
    isNew: true,
    isFeatured: false,
    isTrending: true,
    isBestseller: false,
    tags: [],
    createdAt: new Date(),
  },
];

export function SearchInput({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const matchedCategories = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return siteConfig.categories.filter((c) =>
      c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [query]);

  const matchedProducts = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return MOCK_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    ).slice(0, 3);
  }, [query]);

  const suggestions = React.useMemo(() => {
    const merged: Array<
      | { type: "category"; href: string; label: string }
      | { type: "product"; href: string; label: string }
    > = [];
    matchedCategories.forEach((c) =>
      merged.push({ type: "category", href: `/category/${c.slug}`, label: c.name })
    );
    matchedProducts.forEach((p) =>
      merged.push({ type: "product", href: `/product/${p.slug}`, label: p.name })
    );
    return merged.slice(0, 5);
  }, [matchedCategories, matchedProducts]);

  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (query.trim()) setShowDropdown(true);
      else setShowDropdown(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative w-full", className)}
    >
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground pointer-events-none" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder="Search for sarees, kurtis, dresses..."
        className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))]/40 transition-all"
      />

      {showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-premium border border-border p-2 z-50 animate-fade-in">
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((s, i) => (
                <li key={`${s.type}-${i}`}>
                  <Link
                    href={s.href}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 text-sm transition-colors"
                  >
                    {s.type === "category" ? (
                      <Tag className="w-4 h-4 text-gold flex-shrink-0" />
                    ) : (
                      <Shirt className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate text-foreground">
                        {s.label}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {s.type}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 px-4 text-center text-sm text-muted-foreground">
              No results for &quot;{query}&quot;
            </div>
          )}
          <div className="mt-2 pt-2 border-t border-border">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-[hsl(var(--primary))] font-medium hover:bg-[hsl(var(--primary))]/5 transition-colors"
            >
              Search all results for &quot;{query}&quot;
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
