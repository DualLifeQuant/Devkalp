import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/link': path.resolve(__dirname, './src/shims/next-link.tsx'),
      'next/navigation': path.resolve(__dirname, './src/shims/next-navigation.tsx'),
      'next/image': path.resolve(__dirname, './src/shims/next-image.tsx'),
      'next': path.resolve(__dirname, './src/shims/types.d.ts'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'),
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow binding to host for access on local networks if desired
  },
});
