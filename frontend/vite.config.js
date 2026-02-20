// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: 'localhost',
    port: 5174,
    strictPort: true,
    // SPA fallback - serve index.html for all routes not matching static files
    historyApiFallback: {
      rewrites: [
        // Serve static landing page for root path
        { from: /^\/$/, to: '/landing.html' },
        // Serve React app for /app routes
        { from: /^\/app/, to: '/index.html' },
        // Serve static assets
        { from: /^\/.*\.(js|css|ico|png|jpg|jpeg|svg|woff|woff2)$/, to: (context) => context.parsedUrl.pathname },
        // Serve index.html for all other routes (React Router handles these)
        { from: /^\/.*$/, to: '/index.html' },
      ],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Build configuration for SPA
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
