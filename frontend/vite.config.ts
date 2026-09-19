import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Production-hardened Vite configuration
// 1. sourcemap: false prevents exposing source code in production DevTools
// 2. manualChunks cleanly separates core react vendor chunk from icons and UI code
// 3. esbuild drop drops debugger/console.debug in production builds
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false, // Strict: zero source maps in production output
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react']
        },
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'chunks/[name].[hash].js',
        entryFileNames: 'app.[hash].js'
      }
    }
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['debugger', 'console'] : []
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true
  }
});
