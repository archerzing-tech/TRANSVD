import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
// https://v2.tauri.app/start/frontend/vite/
export default defineConfig(async () => ({
  plugins: [react()],

  // Don't pre-bundle the ffmpeg worker – Vite handles it natively
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg"],
  },

  // Vite options tailored for Tauri development
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
