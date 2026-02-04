import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function validateEnv() {
  const apiUrl = (process.env.VITE_API_URL || '').trim()
  if (!apiUrl) {
    throw new Error('VITE_API_URL is required')
  }
  const enableGoogle = (process.env.VITE_ENABLE_GOOGLE_AUTH || '').toLowerCase() === 'true'
  const googleClientId = (process.env.VITE_GOOGLE_CLIENT_ID || '').trim()
  if (enableGoogle && !googleClientId) {
    throw new Error('VITE_GOOGLE_CLIENT_ID is required when VITE_ENABLE_GOOGLE_AUTH=true')
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'validate-env',
      configResolved() {
        validateEnv()
      },
    },
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
