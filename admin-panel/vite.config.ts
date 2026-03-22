import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    allowedHosts: ['admin.wirbooks.com.tr'],
  },
  preview: {
    allowedHosts: ['admin.wirbooks.com.tr'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
