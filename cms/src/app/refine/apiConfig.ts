export const apiUrl = import.meta.env.VITE_ADMIN_API_URL ?? "http://localhost:8080/api/admin";

export const sessionStorageKeys = {
  identity: "tape_identity",
  token: "tape_token",
} as const;
