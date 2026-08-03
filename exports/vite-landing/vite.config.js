import { defineConfig } from 'vite';

// Plain static page. support.js and assets/ live in public/ and are copied
// to dist/ untouched, so the absolute paths in index.html keep working.
export default defineConfig({
  build: { outDir: 'dist', emptyOutDir: true },
});
