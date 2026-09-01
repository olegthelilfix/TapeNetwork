import type { AuthProvider } from "@refinedev/core";
import axios from "axios";

import { sessionStorageKeys } from "../apiConfig";
import { apiClient } from "../data-provider";

import { getStoredJson, getStoredString, removeStoredValue, setStoredJson, setStoredString } from "@/utils/storage";

type AuthIdentity = {
    email: string;
    role: string;
};

type LoginResponse = AuthIdentity & {
    token: string;
};

type LoginCredentials = {
    email: string;
    password: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

const isAuthIdentity = (value: unknown): value is AuthIdentity => {
    return isRecord(value) && typeof value.email === "string" && typeof value.role === "string";
};

const isLoginResponse = (value: unknown): value is LoginResponse => {
    return isRecord(value)
        && typeof value.email === "string"
        && typeof value.role === "string"
        && typeof value.token === "string";
};

const isLoginCredentials = (value: unknown): value is LoginCredentials => {
    return isRecord(value) && typeof value.email === "string" && typeof value.password === "string";
};

const clearSession = (): void => {
    removeStoredValue(sessionStorageKeys.token);
    removeStoredValue(sessionStorageKeys.identity);
};

const getErrorStatus = (error: unknown): number | undefined => {
    if (axios.isAxiosError(error)) {
        return error.response?.status;
    }

    if (isRecord(error) && typeof error.status === "number") {
        return error.status;
    }

    return undefined;
};

export const authProvider: AuthProvider = {
    login: async (parameters) => {
        if (!isLoginCredentials(parameters)) {
            return {
                success: false,
                error: { name: "Login failed", message: "Email and password are required." },
            };
        }

        try {
            const response = await apiClient.post<unknown>("/auth/login", parameters);

            if (!isLoginResponse(response.data)) {
                return {
                    success: false,
                    error: { name: "Login failed", message: "The server returned an invalid session." },
                };
            }

            setStoredString(sessionStorageKeys.token, response.data.token);
            setStoredJson(sessionStorageKeys.identity, {
                email: response.data.email,
                role: response.data.role,
            } satisfies AuthIdentity);

            return { success: true, redirectTo: "/" };
        } catch {
            return {
                success: false,
                error: { name: "Login failed", message: "Invalid email or password" },
            };
        }
    },

    logout: async () => {
        clearSession();
        return { success: true, redirectTo: "/login" };
    },

    check: async () => {
        if (getStoredString(sessionStorageKeys.token) === null) {
            return { authenticated: false, redirectTo: "/login" };
        }

        try {
            await apiClient.get("/auth/me", { timeout: 5000 });
            return { authenticated: true };
        } catch {
            clearSession();
            return { authenticated: false, redirectTo: "/login" };
        }
    },

    onError: async (error) => {
        const status = getErrorStatus(error);

        if (status === 401 || status === 403) {
            clearSession();
            return { logout: true, redirectTo: "/login", error };
        }

        return {};
    },

    getPermissions: async () => {
        return getStoredJson(sessionStorageKeys.identity, isAuthIdentity)?.role ?? null;
    },

    getIdentity: async () => {
        const identity = getStoredJson(sessionStorageKeys.identity, isAuthIdentity);

        return identity === null
            ? null
            : { id: identity.email, name: identity.email, role: identity.role };
    },
};
