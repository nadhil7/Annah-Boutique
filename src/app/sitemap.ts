import type { MetadataRoute } from "next";
import { fetchCategories, fetchProducts } from "@/lib/catalogApi";
import { siteConfig } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = ["/", "/shop", "/categories", "/collections", "/about", "/contact"].map((path, index) => ({ url: `${siteConfig.url}${path}`, lastModified: now, changeFrequency: index < 2 ? "daily" : "weekly", priority: index === 0 ? 1 : 0.7 }));
  try {
    const [categories, products] = await Promise.all([fetchCategories(), fetchProducts({ limit: 100 })]);
    return [...staticRoutes, ...categories.map((category) => ({ url: `${siteConfig.url}/category/${category.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })), ...products.items.map((product) => ({ url: `${siteConfig.url}/product/${product.slug}`, lastModified: new Date(product.createdAt), changeFrequency: "weekly" as const, priority: product.isFeatured ? 0.9 : 0.6 }))];
  } catch {
    return staticRoutes;
  }
}
