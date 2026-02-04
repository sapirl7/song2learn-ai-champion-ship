const API_URL = (import.meta.env.VITE_API_URL || '').trim()
const ENABLE_GOOGLE_AUTH = (import.meta.env.VITE_ENABLE_GOOGLE_AUTH || '').toLowerCase() === 'true'
const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()

if (!API_URL) {
  throw new Error('VITE_API_URL is required')
}

if (ENABLE_GOOGLE_AUTH && !GOOGLE_CLIENT_ID) {
  throw new Error('VITE_GOOGLE_CLIENT_ID is required when VITE_ENABLE_GOOGLE_AUTH=true')
}

const config = {
  apiUrl: API_URL,
  enableGoogleAuth: ENABLE_GOOGLE_AUTH,
  googleClientId: GOOGLE_CLIENT_ID,
}

export default config
