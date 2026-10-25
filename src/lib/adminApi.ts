import { catalogFetch, type CatalogImage, type CatalogProduct } from "@/lib/catalogApi";
import type { Category } from "@/types/product";

export type AdminVariant = {
  sku: string;
  colour: string;
  size: string;
  price: number;
  availability: "AVAILABLE" | "UNAVAILABLE";
};

export type AdminProduct = CatalogProduct;

export type DashboardStats = {
  activeProducts: number;
  activeCategories: number;
  availableVariants: number;
  unavailableVariants: number;
  inquiries: number;
};

export type AdminProfile = { id: string; email: string; name: string; phone: string | null };

let cachedAdmin: Promise<AdminProfile> | null = null;

export const adminApi = {
  login: (email: string, password: string) => catalogFetch<{ authenticated: boolean }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => {
    if (!cachedAdmin) cachedAdmin = catalogFetch<AdminProfile>("/auth/me").catch((error) => { cachedAdmin = null; throw error; });
    return cachedAdmin;
  },
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => catalogFetch<{ passwordChanged: boolean }>("/auth/password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword, confirmPassword }) }),
  logout: async () => { const result = await catalogFetch<{ loggedOut: boolean }>("/auth/logout", { method: "POST" }); cachedAdmin = null; return result; },
  dashboard: () => catalogFetch<DashboardStats>("/admin/dashboard"),
  categories: (params = "") => catalogFetch<Category[]>(`/admin/categories${params ? `?${params}` : ""}`),
  createCategory: (input: unknown) => catalogFetch<Category>("/admin/categories", { method: "POST", body: JSON.stringify(input) }),
  updateCategory: (id: string, input: unknown) => catalogFetch<Category>(`/admin/categories/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteCategory: (id: string) => catalogFetch<{ deactivated: boolean }>(`/admin/categories/${id}`, { method: "DELETE" }),
  products: (params = "") => catalogFetch<{ items: AdminProduct[]; total: number; page: number; limit: number }>(`/admin/products${params ? `?${params}` : ""}`),
  createProduct: (input: unknown) => catalogFetch<AdminProduct>("/admin/products", { method: "POST", body: JSON.stringify(input) }),
  updateProduct: (id: string, input: unknown) => catalogFetch<AdminProduct>(`/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteProduct: (id: string) => catalogFetch<{ deactivated: boolean }>(`/admin/products/${id}`, { method: "DELETE" }),
  signedUpload: (input: unknown) => catalogFetch<{ uploadUrl: string; token: string; path: string }>("/admin/media/signed-upload-url", { method: "POST", body: JSON.stringify(input) }),
  completeUpload: (input: unknown) => catalogFetch<CatalogImage>("/admin/media/complete", { method: "POST", body: JSON.stringify(input) }),
  updateMedia: (id: string, input: unknown) => catalogFetch<unknown>(`/admin/media/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteMedia: (id: string) => catalogFetch<{ deleted: boolean }>(`/admin/media/${id}`, { method: "DELETE" }),
};
