import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@hint-viewer/shared': resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 3000,
  },
});
