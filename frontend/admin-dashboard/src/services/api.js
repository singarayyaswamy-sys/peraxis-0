import SecurityUtils from '../utils/security'

const API_BASE_URL = 'http://localhost:8080/api/admin'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      // Get admin token
      const token = localStorage.getItem('adminToken')
      
      // Use secure fetch with validation
      const response = await SecurityUtils.secureFetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      })
      
      // Handle unauthorized responses
      if (response.status === 401) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        window.location.href = '/'
        throw new Error('Unauthorized access')
      }
      
      const data = await response.json()
      
      // Validate response data
      if (data && typeof data === 'object') {
        return data
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async getDashboardStats() {
    return this.request('/dashboard/stats')
  }

  async getAllUsers() {
    return this.request('/users')
  }

  async updateUserStatus(userId, status) {
    return this.request(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }

  async getAllOrders() {
    return this.request('/orders')
  }

  async getAllProducts() {
    return this.request('/products')
  }

  async getRevenueAnalytics() {
    return this.request('/analytics/revenue')
  }

  async adminLogin(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }
}

export default new ApiService()