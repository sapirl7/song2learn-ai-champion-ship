import axios from 'axios'
import axiosRetry from 'axios-retry'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').trim()

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Retry logic for network errors and 5xx responses
axiosRetry(client, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status >= 500 && error.response?.status < 600)
  },
})

// Add auth token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    // Axios may represent headers as a plain object or as AxiosHeaders (with .set()).
    if (!config.headers) config.headers = {}
    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`)
    } else {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle auth errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // FastAPI's HTTPBearer returns 403 on missing/invalid token; handle both.
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  demoLogin: () => client.post('/auth/demo-login'),
  getMe: () => client.get('/auth/me'),
}

// Songs API
export const songsApi = {
  search: (query) => client.get('/songs/search', { params: { q: query } }),
  import: (data) => client.post('/songs/import', data),
  get: (id) => client.get(`/songs/${id}`),
  getStory: (id, targetLang) => client.get(`/songs/${id}/story`, { params: { target_lang: targetLang } }),
}

// User Songs API
export const userSongsApi = {
  save: (songId) => client.post(`/user-songs/${songId}/save`),
  getSaved: () => client.get('/user-songs/saved'),
  isSaved: (songId) => client.get(`/user-songs/${songId}/is-saved`),
}

// Analyze API
export const analyzeApi = {
  line: (data) => client.post('/analyze/line', data),
  speak: (data) => client.post('/analyze/speak', data),
  interlinear: (data) => client.post('/analyze/interlinear', data),
}

// Voice API (SPEC v5)
export const voiceApi = {
  speak: (data) => client.post('/voice/speak', data),
}

// Vocabulary API
export const vocabularyApi = {
  create: (data) => client.post('/vocabulary', data),
  translate: (data) => client.post('/vocabulary/translate', data),
  getAll: () => client.get('/vocabulary'),
  delete: (id) => client.delete(`/vocabulary/${id}`),
}

// Exercises API
export const exercisesApi = {
  checkTranslation: (data) => client.post('/exercises/translation-check', data),
}

// Discover API
export const discoverApi = {
  randomIconic: (params) => client.get('/discover/random-iconic', { params }),
}

export default client
