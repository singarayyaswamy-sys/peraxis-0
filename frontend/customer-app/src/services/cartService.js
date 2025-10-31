import api from './api'
import SecurityUtils from '../utils/security'

export const cartService = {
  // Cart operations
  getCart: () => {
    return api.get('/cart')
  },

  addItem: (itemData) => {
    const sanitizedData = {
      productId: SecurityUtils.sanitizeInput(String(itemData.productId)),
      quantity: parseInt(itemData.quantity) || 1,
      variantId: itemData.variantId ? SecurityUtils.sanitizeInput(String(itemData.variantId)) : null
    }
    return api.post('/cart/items', sanitizedData)
  },

  updateQuantity: (productId, quantity) => {
    const sanitizedId = SecurityUtils.sanitizeInput(String(productId))
    const sanitizedQty = Math.max(1, parseInt(quantity) || 1)
    return api.put(`/cart/items/${sanitizedId}`, { quantity: sanitizedQty })
  },

  removeItem: (productId) => {
    const sanitizedId = SecurityUtils.sanitizeInput(String(productId))
    return api.delete(`/cart/items/${sanitizedId}`)
  },

  clearCart: () => {
    return api.delete('/cart')
  },

  // Cart analytics
  getCartSummary: () => {
    return api.get('/cart/summary')
  },

  applyCoupon: (couponCode) => {
    const sanitizedCode = SecurityUtils.sanitizeInput(String(couponCode)).toUpperCase()
    if (!sanitizedCode || !/^[A-Z0-9-_]+$/.test(sanitizedCode)) {
      throw new Error('Invalid coupon code format')
    }
    return api.post('/cart/coupon', { code: sanitizedCode })
  },

  removeCoupon: () => {
    return api.delete('/cart/coupon')
  },

  // Checkout preparation
  validateCart: () => {
    return api.post('/cart/validate')
  },

  getShippingOptions: (address) => {
    return api.post('/cart/shipping-options', { address })
  },

  calculateTax: (address) => {
    return api.post('/cart/calculate-tax', { address })
  },

  // Save for later
  saveForLater: (productId) => {
    const sanitizedId = SecurityUtils.sanitizeInput(String(productId))
    return api.post('/cart/save-later', { productId: sanitizedId })
  },

  moveToCart: (productId) => {
    const sanitizedId = SecurityUtils.sanitizeInput(String(productId))
    return api.post('/cart/move-to-cart', { productId: sanitizedId })
  },

  getSavedItems: () => {
    return api.get('/cart/saved-items')
  }
}