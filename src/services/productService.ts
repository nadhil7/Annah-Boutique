import type {
  Product,
  ProductQuery,
  ProductResult,
  FilterOptions,
} from "@/types/product";
import localRepo from "@/repositories/productRepository";
import {
  filterProducts,
  sortProducts,
  paginateProducts,
  extractFilterOptions,
} from "@/utils/sortFilter";
import { products } from "@/data/products";

export interface SearchSuggestion {
  type: "product" | "category" | "collection" | "tag";
  text: string;
  href: string;
}

export async function getProducts(): Promise<Product[]> {
  return localRepo.getProducts();
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  return localRepo.getProductBySlug(slug);
}

export async function queryProducts(
  q: ProductQuery
): Promise<ProductResult> {
  const all = q.q
    ? await localRepo.searchProducts(q.q)
    : await localRepo.getProducts();

  const filtered = filterProducts(all, q);
  const sorted = sortProducts(filtered, q.sort ?? "featured");
  return paginateProducts(sorted, q.page ?? 1, q.limit ?? 12);
}

export function getFilterOptions(
  seed?: Product[]
): FilterOptions {
  return extractFilterOptions(seed ?? products);
}

export function searchSuggestions(
  sourceProducts: Product[],
  query: string
): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchSuggestion[] = [];
  const seen = new Set<string>();

  const push = (s: SearchSuggestion) => {
    const key = `${s.type}:${s.text}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(s);
  };

  for (const p of sourceProducts) {
    if (results.length >= 8) break;
    if (p.name.toLowerCase().includes(q)) {
      push({
        type: "product",
        text: p.name,
        href: `/product/${p.slug}`,
      });
    }
  }

  for (const p of sourceProducts) {
    if (results.length >= 8) break;
    if (p.category.toLowerCase().includes(q)) {
      push({
        type: "category",
        text: p.category
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        href: `/category/${p.category}`,
      });
    }
  }

  for (const p of sourceProducts) {
    if (results.length >= 8) break;
    if (p.collection.toLowerCase().includes(q)) {
      push({
        type: "collection",
        text: p.collection
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        href: `/collection/${p.collection}`,
      });
    }
  }

  for (const p of sourceProducts) {
    if (results.length >= 8) break;
    for (const t of p.tags) {
      if (t.toLowerCase().includes(q)) {
        push({
          type: "tag",
          text: t.charAt(0).toUpperCase() + t.slice(1),
          href: `/shop?q=${encodeURIComponent(t)}`,
        });
      }
    }
  }

  return results.slice(0, 8);
}
