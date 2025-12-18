import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    postcss: './config',
  },
  server: {
    host: true,
    port: 8080,
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: 'dist',
  }
});
