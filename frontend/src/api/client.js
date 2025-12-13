import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
}

// Vocabulary API
export const vocabularyApi = {
  create: (data) => client.post('/vocabulary', data),
  getAll: () => client.get('/vocabulary'),
  delete: (id) => client.delete(`/vocabulary/${id}`),
}

// Exercises API
export const exercisesApi = {
  checkTranslation: (data) => client.post('/exercises/translation-check', data),
}

export default client
