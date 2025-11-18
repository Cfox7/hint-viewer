import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@hint-viewer/shared': resolve(__dirname, '../shared/types.ts'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        config: resolve(__dirname, 'config.html')
      }
    }
  }
})
