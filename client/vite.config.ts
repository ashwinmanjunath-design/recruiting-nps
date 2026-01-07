import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections (for mobile testing on same network)
    port: 5173,
  },
  optimizeDeps: {
    include: ['react-simple-maps', 'react-is']
  },
  build: {
    commonjsOptions: {
      include: [/react-simple-maps/, /node_modules/]
    }
  }
})
