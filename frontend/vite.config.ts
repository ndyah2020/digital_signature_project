import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Cần thiết để Vite dev server chạy trong Docker
    host: true,
    port: 5173,
    proxy: {
      // Proxy API calls tới backend để tránh CORS issues khi dev
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/contracts': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/signatures': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/2fa': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/recipients': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/audit-logs': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/stats': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
