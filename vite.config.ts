import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Check if we're in development mode and tsx is available
const isDev = process.env.NODE_ENV === "development";
let serverConfig = {};

if (isDev) {
  try {
    // Use dynamic import in a way that doesn't require top-level await
    serverConfig = {
      middlewareMode: true,
      configureServer: async (server) => {
        try {
          const { createServer } = await import("./server/vite");
          return createServer(server);
        } catch (error) {
          console.log("Running in client-only mode");
        }
      },
    };
  } catch (error) {
    console.log("Running in client-only mode");
  }
}

export default defineConfig({
  plugins: [
    react(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    ...serverConfig, // Add the server configuration here
  },
});