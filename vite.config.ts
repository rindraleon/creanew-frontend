import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    plugins: [react()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    css: {
      postcss: {
        plugins: [tailwindcss(), autoprefixer()],
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Chunks stables : le navigateur les garde en cache d'un déploiement à l'autre.
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            query: ["@tanstack/react-query"],
            forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          },
        },
      },
    },
    server: {
      host: true,
      port: 5173,
      allowedHosts: true,
      // Même origine en développement (§50) : le frontend ignore l'URL du backend
      // et aucun cookie n'est cross-origin.
      proxy: {
        "/api": {
          target: process.env.VITE_PROXY_TARGET ?? env.VITE_PROXY_TARGET ?? "http://localhost:3000",
          changeOrigin: true,
        },
        // Les fichiers uploadés (stockage local) sont servis par l'API sur /uploads.
        "/uploads": {
          target: process.env.VITE_PROXY_TARGET ?? env.VITE_PROXY_TARGET ?? "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
  };
});
