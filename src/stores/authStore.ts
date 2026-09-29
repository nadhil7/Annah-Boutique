import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/user";
import mockAuthService from "@/services/authService";

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

export interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<User>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      async login(email, password) {
        set({ isLoading: true, error: null });
        try {
          const user = await mockAuthService.login(email, password);
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Login failed";
          set({ error: message, isLoading: false });
          throw err;
        }
      },
      async register(name, email, password) {
        set({ isLoading: true, error: null });
        try {
          const user = await mockAuthService.register(
            name,
            email,
            password
          );
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Registration failed";
          set({ error: message, isLoading: false });
          throw err;
        }
      },
      async logout() {
        set({ isLoading: true });
        await mockAuthService.logout();
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
      async hydrate() {
        set({ isLoading: true });
        const user = await mockAuthService.getCurrentUser();
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      },
      clearError() {
        const { error } = get();
        if (error) set({ error: null });
      },
    }),
    {
      name: "annah-auth",
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
