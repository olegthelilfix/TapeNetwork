export const apiUrl = import.meta.env.VITE_ADMIN_API_URL ?? "http://localhost:8080/api/admin";

// Base URL of the tape-streamer HLS service. The CMS talks to it directly (not via
// the backend) to list prepared videos and upload new source files.
export const streamerUrl = (import.meta.env.VITE_STREAMER_URL ?? "http://localhost:8082").replace(/\/+$/, "");

export const sessionStorageKeys = {
  identity: "tape_identity",
  token: "tape_token",
} as const;
