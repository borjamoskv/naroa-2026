import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 4000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
