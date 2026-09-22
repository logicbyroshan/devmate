import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite build & dev-server configuration
// Note: Proxies below are active ONLY during local development (npm run dev)
// and preview (npm run preview). Production builds compile to static assets served by Nginx.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        headers: {
          'X-Forwarded-Proto': 'https',
        },
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        headers: {
          'X-Forwarded-Proto': 'https',
        },
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        headers: {
          'X-Forwarded-Proto': 'https',
        },
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        headers: {
          'X-Forwarded-Proto': 'https',
        },
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lenis'],
        },
      },
    },
  },
});

