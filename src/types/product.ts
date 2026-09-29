export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  category: string;
  collection: string;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isBestseller: boolean;
  tags: string[];
  createdAt: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
}

export interface Collection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
}

export type SortKey =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "popular"
  | "discount";

export interface ProductQuery {
  category?: string;
  collection?: string;
  sizes?: string[];
  colors?: string[];
  priceMin?: number;
  priceMax?: number;
  minDiscount?: number;
  inStockOnly?: boolean;
  q?: string;
  sort?: SortKey;
  page?: number;
  limit?: number;
}

export interface ProductResult {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface FilterOptions {
  categories: string[];
  sizes: string[];
  colors: string[];
  collections: string[];
  priceMin: number;
  priceMax: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
