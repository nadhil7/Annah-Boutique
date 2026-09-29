interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export function useCartShim() {
  return {
    items: [] as CartItem[],
    count: 0,
    getItemCount: () => 0,
    addItem: () => {},
    removeItem: () => {},
    updateQuantity: () => {},
    clearCart: () => {},
    getSubtotal: () => 0,
    getDiscount: () => 0,
    getTotal: () => 0,
  };
}

export function useWishlistShim() {
  return {
    items: [] as WishlistItem[],
    count: 0,
    toggle: () => {},
    add: () => {},
    remove: () => {},
    isInList: () => false,
    clear: () => {},
  };
}

export function useAuthShim() {
  return {
    user: null as User | null,
    isAuthenticated: false,
    login: async () => null as User | null,
    logout: async () => {},
    register: async () => null as User | null,
  };
}
