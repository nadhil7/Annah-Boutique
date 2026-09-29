import { describe, it, expect } from "vitest";
import {
  filterProducts,
  sortProducts,
  paginateProducts,
  extractFilterOptions,
} from "@/utils/sortFilter";
import type { Product } from "@/types/product";

const baseCreated = "2026-08-01T00:00:00Z";

const mkProduct = (overrides: Partial<Product>): Product => ({
  id: overrides.id ?? "ANB-TEST",
  slug: overrides.slug ?? "test",
  name: overrides.name ?? "Test",
  description: overrides.description ?? "",
  price: overrides.price ?? 1000,
  originalPrice: overrides.originalPrice ?? 1000,
  discount: overrides.discount ?? 0,
  category: overrides.category ?? "sarees",
  collection: overrides.collection ?? "new-arrivals",
  images: overrides.images ?? ["/a.webp", "/b.webp"],
  colors: overrides.colors ?? ["pink"],
  sizes: overrides.sizes ?? ["M"],
  stock: overrides.stock ?? 10,
  rating: overrides.rating ?? 4.0,
  reviewCount: overrides.reviewCount ?? 10,
  isNew: overrides.isNew ?? false,
  isFeatured: overrides.isFeatured ?? false,
  isTrending: overrides.isTrending ?? false,
  isBestseller: overrides.isBestseller ?? false,
  tags: overrides.tags ?? [],
  createdAt: overrides.createdAt ?? baseCreated,
});

describe("sortFilter utilities", () => {
  const fixtures: Product[] = [
    mkProduct({
      id: "A",
      slug: "banarasi-saree",
      name: "Banarasi Silk Saree",
      category: "sarees",
      price: 5000,
      discount: 10,
      sizes: ["Free Size"],
      colors: ["maroon", "gold"],
      stock: 5,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 200,
      tags: ["silk", "wedding"],
      createdAt: "2026-07-01T00:00:00Z",
    }),
    mkProduct({
      id: "B",
      slug: "floral-kurti",
      name: "Floral Printed Kurti",
      category: "kurtis",
      price: 900,
      discount: 0,
      sizes: ["S", "M", "L"],
      colors: ["pink"],
      stock: 0,
      isFeatured: false,
      rating: 4.2,
      reviewCount: 50,
      tags: ["floral", "cotton", "casual"],
      createdAt: "2026-09-01T00:00:00Z",
    }),
    mkProduct({
      id: "C",
      slug: "anarkali-gown",
      name: "Anarkali Gown Red",
      category: "dresses",
      price: 8000,
      discount: 60,
      sizes: ["S", "M"],
      colors: ["red"],
      stock: 3,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 80,
      tags: ["wedding", "festive"],
      createdAt: "2026-08-15T00:00:00Z",
    }),
    mkProduct({
      id: "D",
      slug: "dhoti-coord",
      name: "Dhoti Co-ord Set",
      category: "co-ord-sets",
      price: 3000,
      discount: 25,
      sizes: ["M", "L", "XL"],
      colors: ["black", "gold"],
      stock: 8,
      isFeatured: false,
      rating: 4.5,
      reviewCount: 30,
      tags: ["party", "embroidered"],
      createdAt: "2026-09-10T00:00:00Z",
    }),
    mkProduct({
      id: "E",
      slug: "party-saree",
      name: "Party Wear Saree",
      category: "sarees",
      price: 4500,
      discount: 40,
      sizes: ["Free Size"],
      colors: ["teal", "green"],
      stock: 12,
      isFeatured: true,
      rating: 4.6,
      reviewCount: 150,
      tags: ["party", "sequin"],
      createdAt: "2026-06-15T00:00:00Z",
    }),
    mkProduct({
      id: "F",
      slug: "summer-cotton-top",
      name: "Summer Cotton Top",
      category: "tops",
      price: 799,
      discount: 15,
      sizes: ["XS", "S", "M", "L"],
      colors: ["beige"],
      stock: 20,
      isFeatured: false,
      rating: 4.0,
      reviewCount: 10,
      tags: ["cotton", "casual", "summer"],
      createdAt: "2026-09-20T00:00:00Z",
    }),
  ];

  it("filterProducts filters by exact category slug", () => {
    const result = filterProducts(fixtures, { category: "sarees" });
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toContain("A");
    expect(result.map((r) => r.id).sort()).toEqual(["A", "E"].sort());
  });

  it("filterProducts filters by minDiscount threshold", () => {
    const result = filterProducts(fixtures, { minDiscount: 30 });
    const ids = result.map((r) => r.id).sort();
    expect(ids).toContain("C");
    expect(ids).toContain("E");
    expect(ids).not.toContain("B");
    expect(result.every((p) => p.discount >= 30)).toBe(true);
  });

  it("filterProducts inStockOnly removes stock=0", () => {
    const withOos = filterProducts(fixtures, {});
    expect(withOos).toHaveLength(fixtures.length);
    const inStock = filterProducts(fixtures, { inStockOnly: true });
    expect(inStock.map((r) => r.id).includes("B")).toBe(false);
    expect(inStock.every((p) => p.stock > 0)).toBe(true);
    expect(inStock).toHaveLength(5);
  });

  it("filterProducts sizes includes any in product.sizes intersection", () => {
    const xlOnly = filterProducts(fixtures, { sizes: ["XL"] });
    expect(xlOnly.map((r) => r.id).sort()).toEqual(["D"].sort());

    const sml = filterProducts(fixtures, { sizes: ["S", "XL"] });
    const ids = sml.map((r) => r.id).sort();
    expect(ids).toContain("B");
    expect(ids).toContain("C");
    expect(ids).toContain("D");
    expect(ids).toContain("F");
  });

  it("filterProducts by search q matches tags", () => {
    const wedding = filterProducts(fixtures, { q: "wedding" });
    const ids = wedding.map((r) => r.id).sort();
    expect(ids).toEqual(["A", "C"].sort());

    const cotton = filterProducts(fixtures, { q: "cotton" });
    expect(cotton.map((r) => r.id).sort()).toEqual(["B", "F"].sort());
  });

  it("sortProducts newest orders by createdAt desc", () => {
    const sorted = sortProducts(fixtures, "newest");
    const order = sorted.map((s) => s.id);
    expect(order[0]).toBe("F");
    expect(order[order.length - 1]).toBe("E");
  });

  it("sortProducts price-asc is ascending", () => {
    const sorted = sortProducts(fixtures, "price-asc");
    const prices = sorted.map((s) => s.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
    expect(prices[0]).toBe(799);
    expect(prices[prices.length - 1]).toBe(8000);
  });

  it("sortProducts discount descending puts 60% before 10%", () => {
    const sorted = sortProducts(fixtures, "discount");
    const discounts = sorted.map((s) => s.discount);
    for (let i = 1; i < discounts.length; i++) {
      expect(discounts[i]).toBeLessThanOrEqual(discounts[i - 1]);
    }
    expect(sorted[0].id).toBe("C");
    expect(sorted[0].discount).toBe(60);
    const idx60 = sorted.findIndex((p) => p.discount === 60);
    const idx10 = sorted.findIndex((p) => p.discount === 10);
    expect(idx60).toBeLessThan(idx10);
  });

  it("sortProducts featured puts isFeatured first then rating desc", () => {
    const sorted = sortProducts(fixtures, "featured");
    const featured = sorted.filter((p) => p.isFeatured);
    expect(featured.length).toBeGreaterThan(0);
    expect(sorted.slice(0, featured.length)).toEqual(featured);
    const featuredRatings = featured.map((p) => p.rating);
    for (let i = 1; i < featuredRatings.length; i++) {
      expect(featuredRatings[i]).toBeLessThanOrEqual(featuredRatings[i - 1]);
    }
  });

  it("sortProducts popular sorts by reviewCount desc then rating", () => {
    const sorted = sortProducts(fixtures, "popular");
    expect(sorted[0].id).toBe("A");
    expect(sorted[0].reviewCount).toBe(200);
    const counts = sorted.map((s) => s.reviewCount);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeLessThanOrEqual(counts[i - 1]);
    }
  });

  it("paginateProducts limits by page/limit correctly and returns total", () => {
    const page1 = paginateProducts(fixtures, 1, 2);
    expect(page1.items).toHaveLength(2);
    expect(page1.total).toBe(fixtures.length);
    expect(page1.page).toBe(1);
    expect(page1.limit).toBe(2);
    expect(page1.items.map((i) => i.id)).toEqual(["A", "B"]);

    const page2 = paginateProducts(fixtures, 2, 2);
    expect(page2.items.map((i) => i.id)).toEqual(["C", "D"]);

    const page3 = paginateProducts(fixtures, 3, 2);
    expect(page3.items.map((i) => i.id)).toEqual(["E", "F"]);

    const page4 = paginateProducts(fixtures, 4, 2);
    expect(page4.items).toHaveLength(0);
  });

  it("extractFilterOptions gathers unique categories/sizes/colors and correct min/max price", () => {
    const opts = extractFilterOptions(fixtures);
    expect(opts.categories.sort()).toEqual(
      ["sarees", "kurtis", "dresses", "co-ord-sets", "tops"].sort()
    );
    expect(opts.priceMin).toBe(799);
    expect(opts.priceMax).toBe(8000);
    expect(opts.sizes).toContain("Free Size");
    expect(opts.sizes).toContain("XL");
    expect(opts.colors).toContain("maroon");
    expect(opts.colors).toContain("beige");
    expect(opts.collections.length).toBeGreaterThan(0);
  });

  it("filterProducts with priceMin and priceMax range", () => {
    const r = filterProducts(fixtures, { priceMin: 1000, priceMax: 5000 });
    expect(r.every((p) => p.price >= 1000 && p.price <= 5000)).toBe(true);
    expect(r.map((p) => p.id).sort()).toEqual(["A", "D", "E"].sort());
  });

  it("filterProducts with collection + search combined", () => {
    const r = filterProducts(fixtures, {
      collection: "new-arrivals",
      q: "cotton",
    });
    expect(r.map((p) => p.id).sort()).toEqual(["B", "F"].sort());
  });
});
