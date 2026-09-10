/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_API_URL: string;
  readonly VITE_STREAMER_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
