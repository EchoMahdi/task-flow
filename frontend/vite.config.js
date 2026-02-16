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
    // Use 127.0.0.1 instead of localhost to avoid IPv6 issues on Windows
    host: '127.0.0.1',
    port: 5174,
    // Force strict port to avoid conflicts
    strictPort: true,
    // Configure HMR explicitly
    hmr: {
      // Use 127.0.0.1 for WebSocket connection
      host: '127.0.0.1',
      port: 5174,
      protocol: 'ws',
    },
    proxy: {
       '/api': {
        target: 'http://127.0.0.1:8000',  
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000', 
        secure: false,
        changeOrigin: true,
      },
    },
    headers: {
      // Cache fonts for 1 year (2592000 seconds = 30 days)
      // Using long cache for immutable font files to improve performance
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  css: {
    // Ensure fonts are processed correctly
    devSourcemap: true,
  },
  optimizeDeps: {
    // Pre-bundle font packages for faster builds
    include: ['@fontsource/vazir'],
  },
})
