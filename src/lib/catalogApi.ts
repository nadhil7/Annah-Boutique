import type { Category, Product, ProductQuery, ProductResult } from "@/types/product";

export type CatalogVariant = {
  id: string;
  sku: string;
  colour: string;
  colourHex?: string | null;
  size: string;
  price: number;
  availability: "AVAILABLE" | "UNAVAILABLE";
};

export type CatalogImage = {
  id: string;
  url: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
  variantId?: string | null;
  variantColour?: string | null;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string | null;
  categoryName: string | null;
  category: string | null;
  status: "ACTIVE" | "INACTIVE";
  featured: boolean;
  variants: CatalogVariant[];
  images: CatalogImage[];
  createdAt: string;
  updatedAt: string;
};

export function orderCatalogImages(images: CatalogImage[]) {
  return [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder);
}

type ApiEnvelope<T> = { success: boolean; data?: T; error?: { message?: string } | string };

export class CatalogApiError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "CatalogApiError";
  }
}

function baseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_API_URL || "http://localhost:4001/api/v1").replace(/\/$/, "");
}

export function catalogUrl(path: string) {
  return `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function catalogFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(catalogUrl(path), {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    const error = typeof payload?.error === "string" ? payload.error : payload?.error?.message;
    const rawError = payload?.error;
    const code = rawError && typeof rawError === "object" && "code" in rawError ? String(rawError.code || "") : undefined;
    throw new CatalogApiError(error || `Request failed (${response.status})`, code);
  }
  return payload.data as T;
}

function mapProduct(raw: CatalogProduct): Product {
  const variants = raw.variants || [];
  const available = variants.filter((variant) => variant.availability === "AVAILABLE");
  const prices = variants.map((variant) => Number(variant.price)).filter(Number.isFinite);
  const price = prices.length ? Math.min(...prices) : 0;
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    description: raw.description,
    price,
    originalPrice: price,
    discount: 0,
    category: raw.category || "",
    collection: "",
    images: orderCatalogImages(raw.images || []).map((image) => image.url),
    colors: [...new Set(variants.map((variant) => variant.colour))],
    sizes: [...new Set(variants.map((variant) => variant.size))],
    stock: available.length,
    rating: 0,
    reviewCount: 0,
    isNew: Date.now() - new Date(raw.createdAt).getTime() < 30 * 86400000,
    isFeatured: raw.featured,
    isTrending: false,
    isBestseller: false,
    tags: [],
    createdAt: raw.createdAt,
    categoryId: raw.categoryId,
    variants,
    variantImages: (raw.images || []).reduce<Record<string, string[]>>((groups, image) => {
      if (image.variantColour && image.url) groups[image.variantColour] = [...(groups[image.variantColour] || []), image.url];
      return groups;
    }, {}),
    status: raw.status,
  };
}

export function mapCatalogProduct(raw: CatalogProduct): Product {
  return mapProduct(raw);
}

export async function fetchCategories(includeInactive = false): Promise<Category[]> {
  const path = includeInactive ? "/admin/categories?limit=200" : "/categories";
  const data = await catalogFetch<unknown>(path);
  const rows = Array.isArray(data) ? data : (data as { items?: unknown[] }).items || [];
  return rows.map((row) => {
    const item = row as Record<string, unknown>;
    return {
      id: String(item.id || ""),
      slug: String(item.slug || ""),
      name: String(item.name || ""),
      description: String(item.description || ""),
      image: String(item.image || ""),
      status: String(item.status || "ACTIVE") as "ACTIVE" | "INACTIVE",
      sortOrder: Number(item.sortOrder ?? item.sort_order ?? 0),
    };
  });
}

export async function fetchFilterOptions() {
  return catalogFetch<{ sizes: string[]; colors: string[]; priceMin: number; priceMax: number }>("/filter-options");
}

function queryParams(query: ProductQuery) {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.q) params.set("search", query.q);
  if (query.sizes?.length) params.set("size", query.sizes.join(","));
  if (query.colors?.length) params.set("colour", query.colors.join(","));
  if (query.priceMin !== undefined) params.set("minPrice", String(query.priceMin));
  if (query.priceMax !== undefined) params.set("maxPrice", String(query.priceMax));
  if (query.inStockOnly) params.set("availability", "AVAILABLE");
  params.set("sort", query.sort === "price-asc" ? "price_asc" : query.sort === "price-desc" ? "price_desc" : query.sort === "popular" || query.sort === "featured" ? "featured" : "newest");
  params.set("page", String(query.page || 1));
  params.set("limit", String(query.limit || 24));
  return params.toString();
}

export async function fetchProducts(query: ProductQuery = {}): Promise<ProductResult> {
  const data = await catalogFetch<{ items: CatalogProduct[]; total: number; page: number; limit: number }>(`/products?${queryParams(query)}`);
  return { ...data, items: data.items.map(mapProduct) };
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    return mapProduct(await catalogFetch<CatalogProduct>(`/products/${encodeURIComponent(slug)}`));
  } catch {
    return null;
  }
}
