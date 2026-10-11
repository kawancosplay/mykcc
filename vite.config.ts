import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: '/',
        name: 'MyKCC - KawanCosplay Community Member Portal',
        short_name: 'MyKCC',
        description: 'MyKCC - KawanCosplay Community official registration',
        theme_color: '#020617', // slate-950
        background_color: '#020617',
        display: 'standalone',
        start_url: '/',
        scope: '/',
      },
      devOptions: {
        enabled: true,
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        // Real pages/endpoints that must not be answered with the SPA shell by the service worker.
        navigateFallbackDenylist: [/^\/privacy/, /^\/api\//, /^\/geo\//],
        // Location lists (public/geo, ~250 files): never precached; each country's file is cached the first
        // time it is used, so address pickers keep working offline for countries already opened.
        globIgnores: ['**/geo/**'],
        runtimeCaching: [
          {
            urlPattern: /\/geo\/[^/]+\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'kcc-geo',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    })],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio cloud environment where WebSockets are not supported
      hmr: false,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
