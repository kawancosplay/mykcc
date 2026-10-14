import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import type { Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Header logo (perf F4): self-hosted 96/160 px WebP files in public/brand/. While they are not in the
// repo the app keeps the remote PNG (KawanCosplayLogo reads __KCC_LOCAL_LOGO__), so a build never points
// at missing files; adding the two files switches every build to the local logo + an early preload.
const LOCAL_LOGO_FILES = ['brand/kcc-logo-96.webp', 'brand/kcc-logo-160.webp'];
const hasLocalLogo = LOCAL_LOGO_FILES.every((file) =>
  fs.existsSync(path.resolve(import.meta.dirname, 'public', file)),
);

/** index.html hints: preload of the local logo, or a preconnect to the remote logo host. */
function kccLogoHints(local: boolean): Plugin {
  return {
    name: 'kcc-logo-hints',
    transformIndexHtml() {
      if (!local) {
        return [{ tag: 'link', attrs: { rel: 'preconnect', href: 'https://i.postimg.cc' }, injectTo: 'head' }];
      }
      return [
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            as: 'image',
            href: '/brand/kcc-logo-96.webp',
            type: 'image/webp',
            imagesrcset: '/brand/kcc-logo-96.webp 96w, /brand/kcc-logo-160.webp 160w',
            imagesizes: '(min-width: 640px) 56px, 44px',
            fetchpriority: 'high',
          },
          injectTo: 'head',
        },
      ];
    },
  };
}

export default defineConfig(() => {
  return {
    define: {
      __KCC_LOCAL_LOGO__: JSON.stringify(hasLocalLogo),
    },
    plugins: [react(), tailwindcss(), kccLogoHints(hasLocalLogo), VitePWA({
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
