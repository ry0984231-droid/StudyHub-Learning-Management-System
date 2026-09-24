import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => ({
  root: __dirname,

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,

    proxy: {
      '/api': process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
    },

    hmr: process.env.DISABLE_HMR !== 'true',

    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },

  build: {
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },
}));