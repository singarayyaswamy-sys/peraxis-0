import api from './api'
import SecurityUtils from '../utils/security'

export const productService = {
  // Product listing and search
  getProducts: (params = {}) => {
    const sanitizedParams = Object.entries(params).reduce((acc, [key, value]) => {
      acc[SecurityUtils.sanitizeInput(key)] = SecurityUtils.sanitizeInput(String(value))
      return acc
    }, {})
    return api.get('/products', { params: sanitizedParams })
  },

  getProductById: (id) => {
    const sanitizedId = SecurityUtils.sanitizeInput(String(id))
    if (!sanitizedId || !/^[a-zA-Z0-9-_]+$/.test(sanitizedId)) {
      throw new Error('Invalid product ID')
    }
    return api.get(`/products/${sanitizedId}`)
  },

  searchProducts: (query, filters = {}) => {
    const sanitizedQuery = SecurityUtils.sanitizeInput(String(query))
    const sanitizedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      acc[SecurityUtils.sanitizeInput(key)] = SecurityUtils.sanitizeInput(String(value))
      return acc
    }, {})
    return api.get('/products/search', {
      params: { q: sanitizedQuery, ...sanitizedFilters }
    })
  },

  // AI-powered search
  aiSearch: (query) => {
    const sanitizedQuery = SecurityUtils.sanitizeInput(String(query))
    if (!sanitizedQuery || sanitizedQuery.length > 500) {
      throw new Error('Invalid search query')
    }
    return api.post('/ai/search', { query: sanitizedQuery })
  },

  getRecommendations: (userId, productId = null) => {
    const sanitizedUserId = SecurityUtils.sanitizeInput(String(userId))
    const sanitizedProductId = productId ? SecurityUtils.sanitizeInput(String(productId)) : null
    return api.get('/ai/recommendations', {
      params: { userId: sanitizedUserId, productId: sanitizedProductId }
    })
  },

  // Categories
  getCategories: () => {
    return api.get('/products/categories')
  },

  getCategoryProducts: (categoryId, params = {}) => {
    const sanitizedCategoryId = SecurityUtils.sanitizeInput(String(categoryId))
    const sanitizedParams = Object.entries(params).reduce((acc, [key, value]) => {
      acc[SecurityUtils.sanitizeInput(key)] = SecurityUtils.sanitizeInput(String(value))
      return acc
    }, {})
    return api.get(`/products/category/${sanitizedCategoryId}`, { params: sanitizedParams })
  },

  // Product details and variants
  getProductVariants: (productId) => {
    const sanitizedId = SecurityUtils.sanitizeInput(String(productId))
    if (!sanitizedId || !/^[a-zA-Z0-9-_]+$/.test(sanitizedId)) {
      throw new Error('Invalid product ID')
    }
    return api.get(`/products/${sanitizedId}/variants`)
  },

  getProductReviews: (productId, params = {}) => {
    const sanitizedId = SecurityUtils.sanitizeInput(String(productId))
    const sanitizedParams = Object.entries(params).reduce((acc, [key, value]) => {
      acc[SecurityUtils.sanitizeInput(key)] = SecurityUtils.sanitizeInput(String(value))
      return acc
    }, {})
    return api.get(`/products/${sanitizedId}/reviews`, { params: sanitizedParams })
  },

  addProductReview: (productId, reviewData) => {
    const sanitizedId = SecurityUtils.sanitizeInput(String(productId))
    const sanitizedData = {
      rating: parseInt(reviewData.rating),
      comment: SecurityUtils.sanitizeInput(String(reviewData.comment || '')),
      title: SecurityUtils.sanitizeInput(String(reviewData.title || ''))
    }
    return api.post(`/products/${sanitizedId}/reviews`, sanitizedData)
  },

  // Wishlist
  addToWishlist: (productId) => {
    const sanitizedId = SecurityUtils.sanitizeInput(String(productId))
    if (!sanitizedId || !/^[a-zA-Z0-9-_]+$/.test(sanitizedId)) {
      throw new Error('Invalid product ID')
    }
    return api.post('/wishlist', { productId: sanitizedId })
  },

  removeFromWishlist: (productId) => {
    const sanitizedId = SecurityUtils.sanitizeInput(String(productId))
    if (!sanitizedId || !/^[a-zA-Z0-9-_]+$/.test(sanitizedId)) {
      throw new Error('Invalid product ID')
    }
    return api.delete(`/wishlist/${sanitizedId}`)
  },

  getWishlist: () => {
    return api.get('/wishlist')
  },

  // Product comparison
  compareProducts: (productIds) => {
    return api.post('/products/compare', { productIds })
  },

  // Trending and featured
  getTrendingProducts: () => {
    return api.get('/products/trending')
  },

  getFeaturedProducts: () => {
    return api.get('/products/featured')
  },

  getDeals: () => {
    return api.get('/products/deals')
  },

  // Product analytics (for tracking user behavior)
  trackProductView: (productId) => {
    const sanitizedId = SecurityUtils.sanitizeInput(String(productId))
    if (!sanitizedId || !/^[a-zA-Z0-9-_]+$/.test(sanitizedId)) {
      return Promise.resolve() // Silently fail for analytics
    }
    return api.post('/analytics/product-view', { productId: sanitizedId })
  },

  trackProductInteraction: (productId, action) => {
    const sanitizedId = SecurityUtils.sanitizeInput(String(productId))
    const sanitizedAction = SecurityUtils.sanitizeInput(String(action))
    if (!sanitizedId || !sanitizedAction) {
      return Promise.resolve() // Silently fail for analytics
    }
    return api.post('/analytics/product-interaction', { 
      productId: sanitizedId, 
      action: sanitizedAction 
    })
  }
}