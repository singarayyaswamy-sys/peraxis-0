import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/authService'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await authService.login(credentials)
          const { user, token } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          
          // Set token for future requests
          if (token) {
            authService.setAuthToken(token)
          }
          
          // Load saved addresses after login
          setTimeout(() => {
            const locationStore = JSON.parse(localStorage.getItem('peraxis-location') || '{}')
            if (locationStore.state && window.locationStoreActions) {
              window.locationStoreActions.loadSavedAddresses()
            }
          }, 100)
          
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.message || 'Login failed' 
          }
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await authService.register(userData)
          const { user } = response.data
          
          set({
            user,
            token: null, // No auto-login after registration
            isAuthenticated: false,
            isLoading: false
          })
          
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.message || 'Registration failed' 
          }
        }
      },

      logout: () => {
        authService.removeAuthToken()
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
        // Clear location data on logout
        const locationStore = JSON.parse(localStorage.getItem('peraxis-location') || '{}')
        if (locationStore.state) {
          locationStore.state.savedAddresses = []
          localStorage.setItem('peraxis-location', JSON.stringify(locationStore))
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true })
        try {
          const response = await authService.updateProfile(profileData)
          const { user } = response.data
          
          set({
            user,
            isLoading: false
          })
          
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.response?.data?.message || 'Update failed' 
          }
        }
      },

      initializeAuth: () => {
        const token = get().token
        if (token) {
          authService.setAuthToken(token)
          set({ isAuthenticated: true })
        }
      },

      refreshToken: async () => {
        try {
          const response = await authService.refreshToken()
          const { token } = response.data
          
          set({ token })
          authService.setAuthToken(token)
          
          return true
        } catch (error) {
          get().logout()
          return false
        }
      }
    }),
    {
      name: 'peraxis-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)