import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), VitePWA({
      registerType: 'autoUpdate',
      // registerSW.js as a deferred script: no extra render-blocking request in <head>.
      injectRegister: 'script-defer',
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
    build: {
      // The Firebase SDK chunk alone is ~575 kB (171 kB gzip); warn only if something grows past that.
      chunkSizeWarningLimit: 600,
      rolldownOptions: {
        output: {
          // Startup vendor code was one ~770 kB chunk (firebase + framer-motion + react). Separate chunks
          // download in parallel and stay cached when only one of the libraries changes.
          codeSplitting: {
            groups: [
              // Highest priority first: groups also pull in their dependencies, so React must be claimed
              // before framer-motion (which depends on it).
              { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 4 },
              { name: 'firebase', test: /node_modules[\\/](@firebase|firebase)[\\/]/, priority: 3 },
              { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/, priority: 2 },
            ],
          },
        },
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
