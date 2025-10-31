import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Validate API base URL to prevent SSRF
const validateApiUrl = (url) => {
  try {
    const parsedUrl = new URL(url)
    const allowedHosts = ['localhost', '127.0.0.1', 'api.peraxis.com']
    const allowedPorts = ['8080', '3000', '443', '80']
    
    if (!allowedHosts.includes(parsedUrl.hostname)) {
      throw new Error('Invalid API host')
    }
    
    if (parsedUrl.port && !allowedPorts.includes(parsedUrl.port)) {
      throw new Error('Invalid API port')
    }
    
    return true
  } catch (error) {
    console.error('Invalid API URL:', error)
    return false
  }
}

if (!validateApiUrl(API_BASE_URL)) {
  throw new Error('Invalid API configuration')
}

// Create axios instance with security configurations
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  maxRedirects: 0, // Prevent redirect-based SSRF
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('peraxis-auth')
    if (token) {
      try {
        const authData = JSON.parse(token)
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`
        }
        if (authData.state?.user?.id) {
          config.headers['X-User-Id'] = authData.state.user.id
        }
      } catch (error) {
        console.error('Error parsing auth token:', error)
      }
    }
    
    // Add request timestamp for analytics
    config.metadata = { startTime: new Date() }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful requests for analytics
    const duration = new Date() - response.config.metadata.startTime
    console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`)
    
    return response
  },
  (error) => {
    // Log failed requests for analytics
    const duration = new Date() - error.config?.metadata?.startTime
    console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`, error.response?.data)
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('peraxis-auth')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status === 403) {
      toast.error('Access denied')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Network error. Please check your connection.')
    }
    
    return Promise.reject(error)
  }
)

export default api