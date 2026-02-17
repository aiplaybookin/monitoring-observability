import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/stream': 'http://localhost:8000',
      '/runs': 'http://localhost:8000',
      '/metrics': 'http://localhost:8000',
      '/checkpoints': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
