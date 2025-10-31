import api from './api'

export const authService = {
  // Authentication endpoints
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed')
    }
    return response
  },

  register: async (userData) => {
    const response = await api.post('/users/register', userData)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Registration failed')
    }
    return response
  },

  logout: async () => {
    try {
      return await api.post('/users/logout')
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Logout failed')
    }
  },

  refreshToken: () => {
    return api.post('/users/refresh')
  },

  // Profile management
  getProfile: () => {
    return api.get('/users/profile')
  },

  updateProfile: (profileData) => {
    return api.put('/users/profile', profileData)
  },

  changePassword: (passwordData) => {
    return api.put('/users/change-password', passwordData)
  },

  // OTP and verification
  sendOTP: (phoneOrEmail) => {
    return api.post('/users/send-otp', { phoneOrEmail })
  },

  verifyOTP: (otpData) => {
    return api.post('/users/verify-otp', otpData)
  },

  // Password reset
  forgotPassword: (email) => {
    return api.post('/users/forgot-password', { email })
  },

  resetPassword: (resetData) => {
    return api.post('/users/reset-password', resetData)
  },

  // OAuth
  googleAuth: (token) => {
    return api.post('/users/google', { token })
  },

  // Utility methods
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  },

  removeAuthToken: () => {
    delete api.defaults.headers.common['Authorization']
  },

  // User activity tracking
  logActivity: (activity) => {
    return api.post('/users/activity', activity)
  }
}