import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Order,
  OrderStatus,
  OrderShipping,
} from "@/types/order";
import type { CartItem } from "@/types/cart";

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

export interface PlaceOrderInput {
  userId?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  shipping: OrderShipping;
  paymentMethod: string;
  status?: OrderStatus;
}

const COUNTER_KEY = "_annah_order_counter";

function nextOrderNumber(): number {
  const s = safeLocalStorage;
  let current = 10000;
  try {
    const raw = s.getItem(COUNTER_KEY);
    if (raw) current = parseInt(raw, 10) || 10000;
  } catch {
    current = 10000;
  }
  const next = current + 1;
  try {
    s.setItem(COUNTER_KEY, String(next));
  } catch {
    // noop
  }
  return next;
}

export interface OrderStore {
  orders: Order[];
  placeOrder: (input: PlaceOrderInput) => Order;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByUser: (userId?: string) => Order[];
  updateStatus: (id: string, status: OrderStatus) => void;
  clear: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      placeOrder(input) {
        const orderNum = nextOrderNumber();
        const id = `ANB-${orderNum}`;
        const order: Order = {
          id,
          userId: input.userId,
          status: input.status ?? "pending",
          createdAt: new Date().toISOString(),
          subtotal: input.subtotal,
          discount: input.discount,
          total: input.total,
          items: input.items,
          shipping: input.shipping,
          paymentMethod: input.paymentMethod,
        };
        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },
      getOrderById(id) {
        return get().orders.find((o) => o.id === id);
      },
      getOrdersByUser(userId) {
        const all = get().orders;
        if (!userId) return all;
        return all.filter((o) => o.userId === userId);
      },
      updateStatus(id, status) {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status } : o
          ),
        }));
      },
      clear() {
        set({ orders: [] });
      },
    }),
    {
      name: "annah-orders",
      storage: createJSONStorage(() => safeLocalStorage),
    }
  )
);
