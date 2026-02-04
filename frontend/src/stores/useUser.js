import { create } from 'zustand'
import { authApi } from '../api/client'
import { useLang } from './useLang'

const TOKENS = {
  access: 'access_token',
  refresh: 'refresh_token',
}

function setTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem(TOKENS.access, accessToken)
  if (refreshToken) localStorage.setItem(TOKENS.refresh, refreshToken)
}

function clearTokens() {
  localStorage.removeItem(TOKENS.access)
  localStorage.removeItem(TOKENS.refresh)
}

export const useUser = create((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  fetchUser: async () => {
    const token = localStorage.getItem(TOKENS.access)
    if (!token) {
      set({ user: null, isLoading: false, isAuthenticated: false })
      return
    }

    try {
      const response = await authApi.getMe()
      set({ user: response.data, isLoading: false, isAuthenticated: true })
      // Force server-backed preferences as source of truth
      useLang.getState().seedFromUser(response.data)
    } catch (error) {
      clearTokens()
      set({ user: null, isLoading: false, isAuthenticated: false })
    }
  },

  login: async (email, password) => {
    const response = await authApi.login({ email, password })
    setTokens(response.data.access_token, response.data.refresh_token)
    await useUser.getState().fetchUser()
    return response.data
  },

  googleLogin: async (idToken, nativeLang, learningLang) => {
    const response = await authApi.google({
      id_token: idToken,
      native_lang: nativeLang,
      learning_lang: learningLang,
    })
    setTokens(response.data.access_token, response.data.refresh_token)
    await useUser.getState().fetchUser()
    return response.data
  },

  demoLogin: async () => {
    const response = await authApi.demoLogin()
    setTokens(response.data.access_token, response.data.refresh_token)
    await useUser.getState().fetchUser()
    return response.data
  },

  register: async (data) => {
    const response = await authApi.register(data)
    setTokens(response.data.access_token, response.data.refresh_token)
    await useUser.getState().fetchUser()
    return response.data
  },

  logout: async () => {
    const refresh = localStorage.getItem(TOKENS.refresh)
    try {
      if (refresh) {
        await authApi.logout(refresh)
      }
    } catch {
      // ignore logout errors
    } finally {
      clearTokens()
      set({ user: null, isAuthenticated: false })
    }
  },
}))
