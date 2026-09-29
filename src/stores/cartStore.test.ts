import { describe, it, expect, beforeEach } from "vitest";
import { createTestCartStore, buildCartLineKey } from "@/stores/cartStore";
import type { Product } from "@/types/product";

const mkProduct = (overrides: Partial<Product>): Product => ({
  id: overrides.id ?? "ANB-001",
  slug: overrides.slug ?? "test-product",
  name: overrides.name ?? "Test Product",
  description: "",
  price: overrides.price ?? 2000,
  originalPrice: overrides.originalPrice ?? 2000,
  discount: overrides.discount ?? 0,
  category: "sarees",
  collection: "new-arrivals",
  images: overrides.images ?? ["/a.webp", "/b.webp"],
  colors: overrides.colors ?? ["pink"],
  sizes: overrides.sizes ?? ["M"],
  stock: overrides.stock ?? 10,
  rating: 4.5,
  reviewCount: 10,
  isNew: false,
  isFeatured: false,
  isTrending: false,
  isBestseller: false,
  tags: [],
  createdAt: new Date().toISOString(),
});

describe("cartStore", () => {
  let useStore: ReturnType<typeof createTestCartStore>;

  beforeEach(() => {
    useStore = createTestCartStore();
  });

  it("addItem increments qty for same variant (same productId + color + size)", () => {
    const product = mkProduct({ id: "ANB-100", price: 1500 });
    useStore.getState().addItem(product, "pink", "M", 1);
    useStore.getState().addItem(product, "pink", "M", 2);

    const state = useStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
    expect(state.items[0].productId).toBe("ANB-100");
    expect(state.items[0].color).toBe("pink");
    expect(state.items[0].size).toBe("M");
  });

  it("addItem with different color makes separate line", () => {
    const product = mkProduct({ id: "ANB-101", price: 2000 });
    useStore.getState().addItem(product, "pink", "M", 1);
    useStore.getState().addItem(product, "navy", "M", 1);
    useStore.getState().addItem(product, "pink", "L", 1);

    const state = useStore.getState();
    expect(state.items).toHaveLength(3);

    const key1 = buildCartLineKey("ANB-101", "pink", "M");
    const key2 = buildCartLineKey("ANB-101", "navy", "M");
    const key3 = buildCartLineKey("ANB-101", "pink", "L");
    const keys = state.items.map((it) =>
      buildCartLineKey(it.productId, it.color, it.size)
    );
    expect(keys.sort()).toEqual([key1, key2, key3].sort());
    state.items.forEach((it) => expect(it.quantity).toBe(1));
  });

  it("updateQuantity clamps quantity between 1 and stock", () => {
    const product = mkProduct({ id: "ANB-102", price: 3000, stock: 5 });
    useStore.getState().addItem(product, "pink", "M", 1);
    const key = buildCartLineKey("ANB-102", "pink", "M");

    useStore.getState().updateQuantity(key, 10, 5);
    expect(useStore.getState().items[0].quantity).toBe(5);

    useStore.getState().updateQuantity(key, 0, 5);
    expect(useStore.getState().items[0].quantity).toBe(1);

    useStore.getState().updateQuantity(key, 3, 5);
    expect(useStore.getState().items[0].quantity).toBe(3);
  });

  it("removeItem deletes only matching line", () => {
    const p1 = mkProduct({ id: "ANB-103", price: 1000 });
    const p2 = mkProduct({ id: "ANB-104", price: 2000 });
    useStore.getState().addItem(p1, "pink", "M", 1);
    useStore.getState().addItem(p1, "navy", "M", 2);
    useStore.getState().addItem(p2, "teal", "L", 1);

    expect(useStore.getState().items).toHaveLength(3);

    const toRemove = buildCartLineKey("ANB-103", "pink", "M");
    useStore.getState().removeItem(toRemove);

    const state = useStore.getState();
    expect(state.items).toHaveLength(2);
    const remainingKeys = state.items.map((it) =>
      buildCartLineKey(it.productId, it.color, it.size)
    );
    expect(remainingKeys).toContain(buildCartLineKey("ANB-103", "navy", "M"));
    expect(remainingKeys).toContain(buildCartLineKey("ANB-104", "teal", "L"));
    expect(remainingKeys).not.toContain(toRemove);
  });

  it("getSubtotal and getTotal calculate correctly against known baseline", () => {
    const pA = mkProduct({ id: "ANB-200", price: 899 });
    const pB = mkProduct({ id: "ANB-201", price: 2499 });
    const pC = mkProduct({ id: "ANB-202", price: 5999 });

    useStore.getState().addItem(pA, "pink", "M", 2);
    useStore.getState().addItem(pB, "navy", "L", 1);
    useStore.getState().addItem(pC, "teal", "S", 1);

    const state = useStore.getState();
    const expectedSubtotal = 899 * 2 + 2499 * 1 + 5999 * 1;
    expect(state.getSubtotal()).toBe(expectedSubtotal);

    const expectedDiscount = 0;
    expect(state.getDiscount()).toBe(expectedDiscount);

    const expectedTotal = expectedSubtotal - expectedDiscount;
    expect(state.getTotal()).toBe(expectedTotal);
    expect(state.getItemCount()).toBe(4);

    const totals = state.getTotals();
    expect(totals.subtotal).toBe(expectedSubtotal);
    expect(totals.discount).toBe(expectedDiscount);
    expect(totals.total).toBe(expectedTotal);
    expect(totals.itemCount).toBe(4);
  });

  it("clearCart empties the cart", () => {
    const p = mkProduct({ id: "ANB-300", price: 5000 });
    useStore.getState().addItem(p, "pink", "M", 2);
    expect(useStore.getState().items.length).toBeGreaterThan(0);
    useStore.getState().clearCart();
    expect(useStore.getState().items).toHaveLength(0);
    expect(useStore.getState().getItemCount()).toBe(0);
  });
});
