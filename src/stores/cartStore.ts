import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, CartTotals } from "@/types/cart";
import type { Product } from "@/types/product";

export type CartLineKey = string;

export function buildCartLineKey(
  productId: string,
  color: string,
  size: string
): CartLineKey {
  return `${productId}::${color}::${size}`;
}

export function lineKeyOfItem(item: CartItem): CartLineKey {
  return buildCartLineKey(item.productId, item.color, item.size);
}

const safeLocalStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // noop
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      // noop
    }
  },
};

export interface CartState {
  items: CartItem[];
  addItem: (
    product: Product,
    color: string,
    size: string,
    qty?: number
  ) => void;
  removeItem: (key: CartLineKey) => void;
  updateQuantity: (key: CartLineKey, qty: number, stock?: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getTotals: () => CartTotals;
}

export function createCartState(): Omit<CartState, "getTotals"> {
  return {
    items: [],
    addItem(
      product: Product,
      color: string,
      size: string,
      qty: number = 1
    ) {
      const key = buildCartLineKey(product.id, color, size);
      const quantity = Math.max(1, Math.floor(qty));
      this.items = (() => {
        const existing = this.items.find(
          (it) => lineKeyOfItem(it) === key
        );
        if (existing) {
          return this.items.map((it) =>
            lineKeyOfItem(it) === key
              ? { ...it, quantity: it.quantity + quantity }
              : it
          );
        }
        return [
          ...this.items,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0] ?? "",
            color,
            size,
            price: product.price,
            quantity,
          },
        ];
      })();
    },
    removeItem(key: CartLineKey) {
      this.items = this.items.filter((it) => lineKeyOfItem(it) !== key);
    },
    updateQuantity(key: CartLineKey, qty: number, stock?: number) {
      const clampedMin = 1;
      const clampedMax =
        typeof stock === "number" ? Math.max(clampedMin, stock) : undefined;
      const target = Math.max(clampedMin, Math.floor(qty));
      const finalQty =
        clampedMax !== undefined ? Math.min(target, clampedMax) : target;
      this.items = this.items.map((it) =>
        lineKeyOfItem(it) === key ? { ...it, quantity: finalQty } : it
      );
    },
    clearCart() {
      this.items = [];
    },
    getItemCount() {
      return this.items.reduce((acc, it) => acc + it.quantity, 0);
    },
    getSubtotal() {
      return this.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    },
    getDiscount() {
      return 0;
    },
    getTotal() {
      return this.getSubtotal() - this.getDiscount();
    },
  };
}

type InternalStore = ReturnType<typeof createCartState>;

export const createCartStore = () =>
  create<CartState>()((_set, _get, store) => {
    const state = createCartState();

    const bindThis = <K extends keyof InternalStore>(
      key: K
    ): InternalStore[K] => {
      const fn = state[key];
      if (typeof fn !== "function") return fn;
      return function (this: unknown, ...args: unknown[]) {
        const ctx = store.getState();
        (fn as (...a: unknown[]) => unknown).apply(ctx, args);
        const after = store.getState();
        // Trigger reactive set if items reference changed
        if (
          (ctx as { items: CartItem[] }).items !==
          (after as { items: CartItem[] }).items
        ) {
          _set({ items: (after as { items: CartItem[] }).items });
        }
        return undefined;
      } as unknown as InternalStore[K];
    };

    return {
      ...state,
      addItem: bindThis("addItem"),
      removeItem: bindThis("removeItem"),
      updateQuantity: bindThis("updateQuantity"),
      clearCart: bindThis("clearCart"),
      getTotals(this: CartState): CartTotals {
        return {
          subtotal: this.getSubtotal(),
          discount: this.getDiscount(),
          total: this.getTotal(),
          itemCount: this.getItemCount(),
        };
      },
    };
  });

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      return {
        items: [],
        addItem(product, color, size, qty = 1) {
          set((state) => {
            const key = buildCartLineKey(product.id, color, size);
            const quantity = Math.max(1, Math.floor(qty));
            const existing = state.items.find(
              (it) => lineKeyOfItem(it) === key
            );
            let items: CartItem[];
            if (existing) {
              items = state.items.map((it) =>
                lineKeyOfItem(it) === key
                  ? { ...it, quantity: it.quantity + quantity }
                  : it
              );
            } else {
              items = [
                ...state.items,
                {
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  image: product.images[0] ?? "",
                  color,
                  size,
                  price: product.price,
                  quantity,
                },
              ];
            }
            return { items };
          });
        },
        removeItem(key) {
          set((state) => ({
            items: state.items.filter((it) => lineKeyOfItem(it) !== key),
          }));
        },
        updateQuantity(key, qty, stock) {
          const clampedMin = 1;
          const clampedMax =
            typeof stock === "number"
              ? Math.max(clampedMin, stock)
              : undefined;
          const target = Math.max(clampedMin, Math.floor(qty));
          const finalQty =
            clampedMax !== undefined ? Math.min(target, clampedMax) : target;
          set((state) => ({
            items: state.items.map((it) =>
              lineKeyOfItem(it) === key
                ? { ...it, quantity: finalQty }
                : it
            ),
          }));
        },
        clearCart() {
          set({ items: [] });
        },
        getItemCount() {
          return get().items.reduce((acc, it) => acc + it.quantity, 0);
        },
        getSubtotal() {
          return get().items.reduce(
            (acc, it) => acc + it.price * it.quantity,
            0
          );
        },
        getDiscount() {
          return 0;
        },
        getTotal() {
          return get().getSubtotal() - get().getDiscount();
        },
        getTotals(): CartTotals {
          const s = get();
          return {
            subtotal: s.getSubtotal(),
            discount: s.getDiscount(),
            total: s.getTotal(),
            itemCount: s.getItemCount(),
          };
        },
      } as CartState;
    },
    {
      name: "annah-cart",
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function createTestCartStore() {
  return create<CartState>()((set, get) => ({
    items: [],
    addItem(product, color, size, qty = 1) {
      set((state) => {
        const key = buildCartLineKey(product.id, color, size);
        const quantity = Math.max(1, Math.floor(qty));
        const existing = state.items.find(
          (it) => lineKeyOfItem(it) === key
        );
        let items: CartItem[];
        if (existing) {
          items = state.items.map((it) =>
            lineKeyOfItem(it) === key
              ? { ...it, quantity: it.quantity + quantity }
              : it
          );
        } else {
          items = [
            ...state.items,
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: product.images[0] ?? "",
              color,
              size,
              price: product.price,
              quantity,
            },
          ];
        }
        return { items };
      });
    },
    removeItem(key) {
      set((state) => ({
        items: state.items.filter((it) => lineKeyOfItem(it) !== key),
      }));
    },
    updateQuantity(key, qty, stock) {
      const clampedMin = 1;
      const clampedMax =
        typeof stock === "number" ? Math.max(clampedMin, stock) : undefined;
      const target = Math.max(clampedMin, Math.floor(qty));
      const finalQty =
        clampedMax !== undefined ? Math.min(target, clampedMax) : target;
      set((state) => ({
        items: state.items.map((it) =>
          lineKeyOfItem(it) === key ? { ...it, quantity: finalQty } : it
        ),
      }));
    },
    clearCart() {
      set({ items: [] });
    },
    getItemCount() {
      return get().items.reduce((acc, it) => acc + it.quantity, 0);
    },
    getSubtotal() {
      return get().items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    },
    getDiscount() {
      return 0;
    },
    getTotal() {
      return get().getSubtotal() - get().getDiscount();
    },
    getTotals(): CartTotals {
      const s = get();
      return {
        subtotal: s.getSubtotal(),
        discount: s.getDiscount(),
        total: s.getTotal(),
        itemCount: s.getItemCount(),
      };
    },
  }));
}
