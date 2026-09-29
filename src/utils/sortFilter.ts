import type {
  Product,
  ProductQuery,
  ProductResult,
  SortKey,
  FilterOptions,
} from "@/types/product";

export function filterProducts(
  products: Product[],
  q: ProductQuery
): Product[] {
  return products.filter((p) => {
    if (q.category && p.category !== q.category) return false;
    if (q.collection && p.collection !== q.collection) return false;
    if (q.sizes && q.sizes.length > 0) {
      const hasSize = p.sizes.some((s) => q.sizes!.includes(s));
      if (!hasSize) return false;
    }
    if (q.colors && q.colors.length > 0) {
      const hasColor = p.colors.some((c) => q.colors!.includes(c));
      if (!hasColor) return false;
    }
    if (q.priceMin !== undefined && p.price < q.priceMin) return false;
    if (q.priceMax !== undefined && p.price > q.priceMax) return false;
    if (q.minDiscount !== undefined && p.discount < q.minDiscount) return false;
    if (q.inStockOnly && p.stock <= 0) return false;
    if (q.q) {
      const search = q.q.toLowerCase();
      const matchName = p.name.toLowerCase().includes(search);
      const matchCategory = p.category.toLowerCase().includes(search);
      const matchCollection = p.collection.toLowerCase().includes(search);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(search));
      if (!(matchName || matchCategory || matchCollection || matchTags))
        return false;
    }
    return true;
  });
}

export function sortProducts(
  products: Product[],
  sort: SortKey = "featured"
): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "featured":
      return sorted.sort((a, b) => {
        if (b.isFeatured !== a.isFeatured) return b.isFeatured ? 1 : -1;
        return b.rating - a.rating;
      });
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "popular":
      return sorted.sort((a, b) => {
        if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
        return b.rating - a.rating;
      });
    case "discount":
      return sorted.sort((a, b) => b.discount - a.discount);
    default:
      return sorted;
  }
}

export function paginateProducts(
  items: Product[],
  page: number = 1,
  limit: number = 12
): ProductResult {
  const total = items.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    items: items.slice(start, end),
    total,
    page,
    limit,
  };
}

export function extractFilterOptions(products: Product[]): FilterOptions {
  const categories = new Set<string>();
  const sizes = new Set<string>();
  const colors = new Set<string>();
  const collections = new Set<string>();
  let priceMin = Infinity;
  let priceMax = -Infinity;

  for (const p of products) {
    categories.add(p.category);
    collections.add(p.collection);
    for (const s of p.sizes) sizes.add(s);
    for (const c of p.colors) colors.add(c);
    if (p.price < priceMin) priceMin = p.price;
    if (p.price > priceMax) priceMax = p.price;
  }

  return {
    categories: Array.from(categories).sort(),
    sizes: Array.from(sizes).sort(),
    colors: Array.from(colors).sort(),
    collections: Array.from(collections).sort(),
    priceMin: priceMin === Infinity ? 0 : priceMin,
    priceMax: priceMax === -Infinity ? 0 : priceMax,
  };
}
