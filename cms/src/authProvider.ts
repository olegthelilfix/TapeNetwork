import type { AuthProvider } from "@refinedev/core";
import axios from "axios";
import { API_URL, TOKEN_KEY } from "./dataProvider";

const IDENTITY_KEY = "tape_identity";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(IDENTITY_KEY, JSON.stringify({ email: data.email, role: data.role }));
      return { success: true, redirectTo: "/" };
    } catch {
      return {
        success: false,
        error: { name: "Login failed", message: "Invalid email or password" },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(IDENTITY_KEY);
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { authenticated: false, redirectTo: "/login" };

    try {
      await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      return { authenticated: true };
    } catch (err: any) {
      // Server unreachable (network error, timeout) or token invalid (401/403)
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(IDENTITY_KEY);
      return { authenticated: false, redirectTo: "/login" };
    }
  },

  onError: async (error) => {
    const status = error?.response?.status ?? error?.status;
    if (status === 401 || status === 403) {
      return { logout: true, redirectTo: "/login", error };
    }
    return {};
  },

  getPermissions: async () => {
    const raw = localStorage.getItem(IDENTITY_KEY);
    return raw ? JSON.parse(raw).role : null;
  },

  getIdentity: async () => {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (!raw) return null;
    const id = JSON.parse(raw);
    return { id: id.email, name: id.email, role: id.role };
  },
};
