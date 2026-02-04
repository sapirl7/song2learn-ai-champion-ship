import axios from 'axios'
import axiosRetry from 'axios-retry'
import config from '../config'

const API_BASE_URL = config.apiUrl

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

const TOKENS = {
  access: 'access_token',
  refresh: 'refresh_token',
}

const tokenStore = {
  getAccess() {
    return localStorage.getItem(TOKENS.access)
  },
  getRefresh() {
    return localStorage.getItem(TOKENS.refresh)
  },
  set(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem(TOKENS.access, accessToken)
    if (refreshToken) localStorage.setItem(TOKENS.refresh, refreshToken)
  },
  clear() {
    localStorage.removeItem(TOKENS.access)
    localStorage.removeItem(TOKENS.refresh)
  },
}

// Add auth token to requests
client.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
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

let isRefreshing = false
let refreshQueue = []

const processQueue = (error, accessToken = null) => {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(accessToken)
  })
  refreshQueue = []
}

// Handle auth errors with refresh flow
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (!original) return Promise.reject(error)

    // Only handle 401s for protected endpoints, and avoid infinite loop
    if (error.response?.status !== 401 || original.__isRetryRequest) {
      return Promise.reject(error)
    }

    const refreshToken = tokenStore.getRefresh()
    if (!refreshToken) {
      tokenStore.clear()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then((accessToken) => {
        original.__isRetryRequest = true
        if (!original.headers) original.headers = {}
        if (typeof original.headers.set === 'function') {
          original.headers.set('Authorization', `Bearer ${accessToken}`)
        } else {
          original.headers.Authorization = `Bearer ${accessToken}`
        }
        return client(original)
      })
    }

    isRefreshing = true
    original.__isRetryRequest = true

    try {
      const resp = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
      const { access_token, refresh_token } = resp.data || {}
      if (!access_token || !refresh_token) throw new Error('Invalid refresh response')
      tokenStore.set(access_token, refresh_token)
      processQueue(null, access_token)

      if (!original.headers) original.headers = {}
      if (typeof original.headers.set === 'function') {
        original.headers.set('Authorization', `Bearer ${access_token}`)
      } else {
        original.headers.Authorization = `Bearer ${access_token}`
      }
      return client(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      tokenStore.clear()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

// Auth API
export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  google: (data) => client.post('/auth/google', data),
  demoLogin: () => client.post('/auth/demo-login'),
  refresh: (refreshToken) => client.post('/auth/refresh', { refresh_token: refreshToken }),
  logout: (refreshToken) => client.post('/auth/logout', { refresh_token: refreshToken }),
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
  line: (data, config) => client.post('/analyze/line', data, config),
  interlinear: (data) => client.post('/analyze/interlinear', data),
}

// Voice API
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

// Discover API (90s timeout for Render cold start + LRCLIB retries + Cerebras)
export const discoverApi = {
  randomIconic: (params) => client.get('/discover/random-iconic', { params, timeout: 90000 }),
}

// Meta API
export const metaApi = {
  languages: () => client.get('/meta/languages'),
}

// Users API
export const usersApi = {
  updatePreferences: (data) => client.patch('/users/me/preferences', data),
}

export default client
