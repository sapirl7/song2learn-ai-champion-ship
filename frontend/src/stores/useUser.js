import { create } from 'zustand'
import { authApi } from '../api/client'

export const useUser = create((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  fetchUser: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ user: null, isLoading: false, isAuthenticated: false })
      return
    }

    try {
      const response = await authApi.getMe()
      set({ user: response.data, isLoading: false, isAuthenticated: true })
    } catch (error) {
      localStorage.removeItem('token')
      set({ user: null, isLoading: false, isAuthenticated: false })
    }
  },

  login: async (email, password) => {
    const response = await authApi.login({ email, password })
    localStorage.setItem('token', response.data.access_token)
    await useUser.getState().fetchUser()
    return response.data
  },

  register: async (data) => {
    const response = await authApi.register(data)
    localStorage.setItem('token', response.data.access_token)
    await useUser.getState().fetchUser()
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, isAuthenticated: false })
  },
}))
