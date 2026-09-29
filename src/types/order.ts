import type { CartItem } from "@/types/cart";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderShipping {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: string;
  userId?: string;
  status: OrderStatus;
  createdAt: string;
  subtotal: number;
  discount: number;
  total: number;
  items: CartItem[];
  shipping: OrderShipping;
  paymentMethod: string;
}
