import api from './api'
import SecurityUtils from '../utils/security'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

class ActivityService {
  async logActivity(userId, action, resource, userRole = 'CUSTOMER', metadata = {}) {
    try {
      const sanitizedData = {
        userId: SecurityUtils.sanitizeInput(String(userId)),
        action: SecurityUtils.sanitizeInput(String(action)),
        resource: SecurityUtils.sanitizeInput(String(resource)),
        userRole: SecurityUtils.sanitizeInput(String(userRole)),
        metadata: Object.entries(metadata).reduce((acc, [key, value]) => {
          acc[SecurityUtils.sanitizeInput(key)] = SecurityUtils.sanitizeInput(String(value))
          return acc
        }, {})
      }
      
      const response = await api.post('/activity/log', sanitizedData)
      return response.data
    } catch (error) {
      console.error('Failed to log activity:', error)
      return null
    }
  }

  async logSearch(query, userId = null, category = null) {
    return this.logActivity(
      userId || 'anonymous',
      'SEARCH',
      'products',
      'CUSTOMER',
      { query, category }
    )
  }

  async logAISearch(query, userId = null) {
    return this.logActivity(
      userId || 'anonymous',
      'AI_SEARCH',
      'products',
      'CUSTOMER',
      { query, type: 'semantic' }
    )
  }

  async logAddToCart(productId, userId) {
    return this.logActivity(
      userId,
      'ADD_TO_CART',
      'cart',
      'CUSTOMER',
      { productId }
    )
  }

  async logLogin(userId, method = 'email') {
    return this.logActivity(
      userId,
      'LOGIN',
      'auth',
      'CUSTOMER',
      { method }
    )
  }

  async logProductView(productId, userId = null) {
    return this.logActivity(
      userId || 'anonymous',
      'VIEW_PRODUCT',
      'products',
      'CUSTOMER',
      { productId }
    )
  }

  async logPageView(page, userId = null) {
    return this.logActivity(
      userId || 'anonymous',
      'PAGE_VIEW',
      'navigation',
      'CUSTOMER',
      { page }
    )
  }
}

export default new ActivityService()