import { create } from "zustand";
import type { User, LoginInput, RegisterInput } from "../types/auth";
import {
  loginApi,
  registerApi,
  logoutApi,
  refreshApi,
  getMeApi,
} from "../services/auth.service";
import { setAccessTokenInMemory } from "../services/apiClient";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;

  login: (input: LoginInput) => Promise<{ success: boolean; message?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,

  clearError: () => set({ error: null }),

  login: async (input: LoginInput) => {
    set({ isLoading: true, error: null });
    try {
      const res = await loginApi(input);

      if (res.success && res.data) {
        setAccessTokenInMemory(res.data.accessToken);
        set({
          user: res.data.user,
          accessToken: res.data.accessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true };
      } else {
        const errorMessage = res.message || "Login failed";
        set({ isLoading: false, error: errorMessage });
        return { success: false, message: errorMessage };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      set({ isLoading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  register: async (input: RegisterInput) => {
    set({ isLoading: true, error: null });
    try {
      const res = await registerApi(input);

      if (res.success && res.data) {
        setAccessTokenInMemory(res.data.accessToken);
        set({
          user: res.data.user,
          accessToken: res.data.accessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true };
      } else {
        const errorMessage = res.message || "Registration failed";
        set({ isLoading: false, error: errorMessage });
        return { success: false, message: errorMessage };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      set({ isLoading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutApi();
    } catch {
      // Ignore network errors on logout
    }
    setAccessTokenInMemory(null);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      // 1. Try refreshing token session via HTTP-only cookie
      const refreshRes = await refreshApi();
      if (refreshRes.success && refreshRes.data?.accessToken) {
        setAccessTokenInMemory(refreshRes.data.accessToken);

        // 2. Fetch current user profile
        const meRes = await getMeApi();
        if (meRes.success && meRes.data?.user) {
          set({
            user: meRes.data.user,
            accessToken: refreshRes.data.accessToken,
            isAuthenticated: true,
            isCheckingAuth: false,
          });
          return;
        }
      }
    } catch {
      // Ignore errors if unauthenticated
    }

    setAccessTokenInMemory(null);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isCheckingAuth: false,
    });
  },
}));
