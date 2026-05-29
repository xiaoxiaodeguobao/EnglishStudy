import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages deploys to /<repo-name>/ by default.
  // Set base to './' so assets use relative paths and work on any sub-path.
  base: './',
  plugins: [react()],
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          // React Query and Virtual
          if (id.includes('node_modules/@tanstack')) {
            return 'query-vendor';
          }
          // Data management libraries
          if (id.includes('node_modules/dexie') || id.includes('node_modules/zustand')) {
            return 'data-vendor';
          }
          // UI libraries
          if (id.includes('node_modules/@headlessui') || id.includes('node_modules/lucide-react')) {
            return 'ui-vendor';
          }
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
