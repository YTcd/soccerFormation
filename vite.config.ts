import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 8000, open: true },
  build: { target: 'es2022' },
});
