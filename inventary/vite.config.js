import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "/admin/",
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_URL || "http://localhost:8080",
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: env.VITE_BACKEND_URL || "http://localhost:8080",
          changeOrigin: true,
          secure: false,
        },
      },
      // This makes the server accessible externally
      host: true,
      hmr: {
        // Use plain WS when served via Caddy over HTTP; Caddy will proxy upgrades
        protocol: "ws",
        // Ensure the client connects back to port 80 (Caddy), not 5173 directly
        clientPort: 80,
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["@testing-library/jest-dom"],
      // coverage reporting can be added later when vitest 3 is adopted
    },
  };
});
