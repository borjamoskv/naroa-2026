import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Inline assets smaller than 4kb
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        // Chunk strategy: separate games from core
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
    open: true
  }
});
