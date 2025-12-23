import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: {
          overlay: false // Disable error overlay for better performance
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Optimize bundle size
        rollupOptions: {
          output: {
            manualChunks: {
              // Separate vendor chunks for better caching
              vendor: ['react', 'react-dom'],
              router: ['react-router-dom'],
              icons: ['lucide-react'],
              utils: ['axios']
            }
          }
        },
        // Enable source maps for debugging in dev, disable in prod
        sourcemap: mode === 'development',
        // Optimize chunk size
        chunkSizeWarningLimit: 1000,
        // Enable minification
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production', // Remove console.logs in production only
            drop_debugger: true
          }
        }
      },
      // Enable optimizations
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'axios']
      }
    };
});
