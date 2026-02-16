/**
 * Vite Build Configuration — Naroa 2026
 * 
 * Architecture Notes:
 * - Entry: index.html (multi-page app via traditional script tags)
 * - main.js: CSS-only entry point for Vite's CSS pipeline
 * - JS modules: loaded via <script> tags for progressive enhancement
 * 
 * Chunking Strategy:
 * Manual chunks separate code by domain for optimal caching:
 * - vendor:  node_modules (rarely changes → long cache)
 * - games:   features/*-game.js (loaded on demand in /juegos)
 * - audio:   audio modules (defer-loaded, not critical path)
 * - effects: visual effects (defer-loaded, enhance experience)
 * - webgl:   WebGL shaders/renderers (heaviest, lazy-loaded)
 * 
 * @see https://vitejs.dev/config/
 */

import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Inline assets smaller than 4kb (base64, saves HTTP requests)
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        /**
         * Manual chunk splitting for optimal caching and load performance.
         * Each chunk is fingerprinted for aggressive browser caching.
         * @param {string} id - Module ID (file path)
         * @returns {string|undefined} Chunk name
         */
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('/features/') && id.includes('-game')) {
            return 'games';
          }
          if (id.includes('/audio/')) {
            return 'audio';
          }
          if (id.includes('/effects/')) {
            return 'effects';
          }
          if (id.includes('/webgl/')) {
            return 'webgl';
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});
