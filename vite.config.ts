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
        navigateFallbackDenylist: [/^\/privacy/, /^\/api\//],
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
