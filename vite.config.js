import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic'
  },
  server: {
    proxy: { '/api': 'http://127.0.0.1:4174' }
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        preview: resolve(__dirname, 'preview/index.html')
      }
    }
  }
});
