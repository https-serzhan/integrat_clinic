import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/integrat_clinic/' : '/',
  plugins: [react()],
  server: {
    port: 5173
  },
  preview: {
    port: 4173
  }
}));
