import api from '../services/api'
import SecurityUtils from './security'

class ActivityLogger {
  constructor() {
    this.queue = []
    this.isProcessing = false
    this.batchSize = 10
    this.flushInterval = 5000 // 5 seconds
    
    // Start periodic flush
    setInterval(() => this.flush(), this.flushInterval)
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush())
  }
  
  log(action, data = {}) {
    const user = SecurityUtils.safeJSONParse(localStorage.getItem('user'), {}) || {}
    
    // Clean data to prevent HTML entity encoding
    const cleanData = JSON.parse(JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    }))
    
    const logEntry = {
      service: 'customer-app',
      action,
      userId: user?.id || 'anonymous',
      data: cleanData
    }
    
    this.queue.push(logEntry)
    
    if (this.queue.length >= this.batchSize) {
      this.flush()
    }
  }
  
  async flush() {
    if (this.queue.length === 0 || this.isProcessing) return
    
    this.isProcessing = true
    const batch = [...this.queue]
    this.queue = []
    
    try {
      const token = localStorage.getItem('peraxis-auth')
      let authHeaders = { 'Content-Type': 'application/json' }
      
      if (token) {
        try {
          const authData = JSON.parse(token)
          if (authData.state?.token) {
            authHeaders['Authorization'] = `Bearer ${authData.state.token}`
          }
        } catch (e) {
          // Ignore auth parsing errors
        }
      }
      
      await Promise.all(
        batch.map(entry => 
          fetch('http://localhost:8080/api/admin/logs/activity', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify(entry)
          }).catch(error => {
            // Silently handle 403/401 errors to avoid console spam
            if (error.status !== 403 && error.status !== 401) {
              console.warn('Activity log failed:', error.status)
            }
          })
        )
      )
    } catch (error) {
      // Silently handle batch errors
      if (error.status !== 403 && error.status !== 401) {
        console.warn('Activity logging batch failed')
      }
    }
    
    this.isProcessing = false
  }
  
  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + SecurityUtils.generateSecureSessionId()
      sessionStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  }
  
  // Specific activity methods
  logPageView(page) {
    this.log('page_view', { page })
  }
  
  logProductView(productId) {
    this.log('product_view', { productId })
  }
  
  logSearch(query, results) {
    this.log('search', { query, resultCount: results })
  }
  
  logCartAction(action, productId, quantity) {
    this.log('cart_action', { action, productId, quantity })
  }
  
  logPurchase(orderId, total, items) {
    this.log('purchase', { orderId, total, itemCount: items })
  }
  
  logAIInteraction(query, response) {
    this.log('ai_interaction', { query, responseLength: response?.length })
  }
  
  logError(error, context) {
    this.log('error', { error: error.message, context })
  }
  
  logPerformance(metric, value) {
    this.log('performance', { metric, value })
  }
}

export default new ActivityLogger()