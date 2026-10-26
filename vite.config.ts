import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 8000, open: true },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        radar: fileURLToPath(new URL('./radar.html', import.meta.url)),
      },
    },
  },
});
