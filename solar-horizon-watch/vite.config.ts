import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      workbox: {
        maximumFileSizeToCacheInBytes: 8000000, // 8MB limit for large bundles
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
      },
      manifest: {
        name: 'Aetheria Space Weather Dashboard',
        short_name: 'Aetheria',
        start_url: '/',
        display: 'standalone',
        theme_color: '#0ea5e9',
        background_color: '#000814',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
