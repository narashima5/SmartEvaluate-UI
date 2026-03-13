import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    chunkSizeWarningLimit: 2000,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://13.51.173.229:5000',
        changeOrigin: true,
      }
    }
  }
})
