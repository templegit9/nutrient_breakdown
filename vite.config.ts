import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Enable required features for Transformers.js
  optimizeDeps: {
    exclude: ['@xenova/transformers']
  },
  build: {
    rollupOptions: {
      external: ['@xenova/transformers'],
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'chart-vendor': ['recharts']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Basic minification
    minify: true,
    // No source maps for production
    sourcemap: false
  },
  // Configure for deployment
  base: '/',
  // Environment variable prefix
  envPrefix: 'VITE_'
})