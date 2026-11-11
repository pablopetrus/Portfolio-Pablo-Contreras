import path from 'path';
import { defineConfig } from 'vite';


export default defineConfig({
  server: {
    port: 3000,
    host: '127.0.0.1',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        ig: path.resolve(__dirname, 'ig.html'),
        reflexiones: path.resolve(__dirname, 'reflexiones.html'),
        montana: path.resolve(__dirname, 'montana.html'),
        lab: path.resolve(__dirname, 'lab.html'),
      },
    },
  },
});
