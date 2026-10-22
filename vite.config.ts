import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // relative asset paths so it works under https://<user>.github.io/<repo>/
  server: { port: 8000, open: true },
  build: { target: 'es2022' }, // main.ts uses top-level await
});
