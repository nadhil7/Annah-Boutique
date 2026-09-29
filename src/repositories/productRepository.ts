import type { Product } from "@/types/product";
import { products, productsBySlug, productsMap } from "@/data/products";

export interface ProductRepository {
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductsByCollection(collection: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
}

export class LocalProductRepository implements ProductRepository {
  private readonly all: Product[];
  private readonly byId: Record<string, Product>;
  private readonly bySlug: Record<string, Product>;

  constructor() {
    this.all = products;
    this.byId = productsMap;
    this.bySlug = productsBySlug;
  }

  private wait<T>(value: T): Promise<T> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(value), 0)
    );
  }

  async getProducts(): Promise<Product[]> {
    return this.wait([...this.all]);
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.wait(this.byId[id] ?? null);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return this.wait(this.bySlug[slug] ?? null);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.wait(
      this.all.filter((p) => p.category === category)
    );
  }

  async getProductsByCollection(collection: string): Promise<Product[]> {
    return this.wait(
      this.all.filter((p) => p.collection === collection)
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.wait([]);
    return this.wait(
      this.all.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
    );
  }
}

const localRepo: ProductRepository = new LocalProductRepository();
export default localRepo;
