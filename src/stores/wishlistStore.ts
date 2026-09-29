import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistEntry {
  productId: string;
  addedAt: string;
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

export interface WishlistStore {
  items: WishlistEntry[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  toggle: (productId: string) => void;
  isInList: (productId: string) => boolean;
  count: () => number;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      add(productId) {
        set((state) => {
          if (state.items.some((it) => it.productId === productId))
            return state;
          return {
            items: [
              ...state.items,
              { productId, addedAt: new Date().toISOString() },
            ],
          };
        });
      },
      remove(productId) {
        set((state) => ({
          items: state.items.filter((it) => it.productId !== productId),
        }));
      },
      toggle(productId) {
        const s = get();
        if (s.isInList(productId)) s.remove(productId);
        else s.add(productId);
      },
      isInList(productId) {
        return get().items.some((it) => it.productId === productId);
      },
      count() {
        return get().items.length;
      },
      clear() {
        set({ items: [] });
      },
    }),
    {
      name: "annah-wishlist",
      storage: createJSONStorage(() => safeLocalStorage),
    }
  )
);

export interface MoveToCartOptions {
  color: string;
  size: string;
  qty?: number;
  productsById?: Record<string, { id: string; slug: string; name: string; images: string[]; price: number }>;
}

export async function moveAllWishlistToCart(
  wishlist: WishlistStore,
  cart: {
    addItem: (
      product: {
        id: string;
        slug: string;
        name: string;
        images: string[];
        price: number;
      },
      color: string,
      size: string,
      qty?: number
    ) => void;
  },
  opts: MoveToCartOptions
) {
  const { color, size, qty = 1, productsById } = opts;
  const moved: string[] = [];
  for (const entry of wishlist.items) {
    const product = productsById?.[entry.productId];
    if (!product) continue;
    cart.addItem(product, color, size, qty);
    moved.push(entry.productId);
  }
  for (const pid of moved) wishlist.remove(pid);
  return moved;
}
