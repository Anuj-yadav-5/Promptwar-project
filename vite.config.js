import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: true,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Firebase services → one chunk (big but isolated)
          if (id.includes('node_modules/firebase')) return 'firebase';
          // React core → vendor chunk
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) return 'vendor';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-is')) return 'vendor';
          // Leaflet maps — leaflet itself only (react-leaflet auto-resolves)
          if (id.includes('node_modules/leaflet/')) return 'maps';
          // Recharts + d3 internals → charts chunk
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/internmap') || id.includes('node_modules/robust-predicates')) return 'charts';
          // Lucide icons → icons chunk to avoid bloating main bundle
          if (id.includes('node_modules/lucide')) return 'icons';
        }
      }
    }
  }
})
