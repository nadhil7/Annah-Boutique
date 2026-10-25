import type {
  Product,
  ProductQuery,
  ProductResult,
  FilterOptions,
} from "@/types/product";
import { fetchCategories, fetchFilterOptions, fetchProductBySlug, fetchProducts } from "@/lib/catalogApi";

export interface SearchSuggestion {
  type: "product" | "category" | "collection" | "tag";
  text: string;
  href: string;
}

export async function getProducts(): Promise<Product[]> {
  return (await fetchProducts({ limit: 100 })).items;
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  return fetchProductBySlug(slug);
}

export async function queryProducts(
  q: ProductQuery
): Promise<ProductResult> {
  return fetchProducts(q);
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const [result, options] = await Promise.all([fetchProducts({ limit: 24 }), fetchFilterOptions()]);
  return {
    categories: [...new Set(result.items.map((product) => product.category).filter(Boolean))] as string[],
    sizes: options.sizes,
    colors: options.colors,
    collections: [],
    priceMin: options.priceMin,
    priceMax: options.priceMax,
  };
}

export async function searchSuggestions(query: string): Promise<SearchSuggestion[]> {
  const q = query.trim();
  if (!q) return [];
  const [products, categories] = await Promise.all([fetchProducts({ q, limit: 5 }), fetchCategories()]);
  const lower = q.toLowerCase();
  return [
    ...categories.filter((category) => `${category.name} ${category.slug}`.toLowerCase().includes(lower)).slice(0, 3).map((category) => ({ type: "category" as const, text: category.name, href: `/category/${category.slug}` })),
    ...products.items.slice(0, 5).map((product) => ({ type: "product" as const, text: product.name, href: `/product/${product.slug}` })),
  ].slice(0, 8);
}
