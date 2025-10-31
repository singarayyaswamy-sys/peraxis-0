import SecurityUtils from './security'

class CSRFProtection {
  constructor() {
    this.token = null
    this.refreshToken()
  }

  refreshToken() {
    this.token = SecurityUtils.generateCSRFToken()
    const expiry = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    
    // Store in secure storage with expiry
    localStorage.setItem('csrf-token', this.token)
    localStorage.setItem('csrf-token-expiry', expiry.toString())
    
    // Add to meta tag for server-side validation with proper escaping
    let metaTag = document.querySelector('meta[name="csrf-token"]')
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.name = 'csrf-token'
      document.head.appendChild(metaTag)
    }
    // Sanitize token before setting to prevent XSS
    metaTag.content = SecurityUtils.sanitizeInput(this.token)
  }

  getToken() {
    const storedToken = localStorage.getItem('csrf-token')
    const expiry = localStorage.getItem('csrf-token-expiry')
    
    // Check if token exists and is not expired
    if (!storedToken || (expiry && Date.now() > parseInt(expiry))) {
      this.refreshToken()
      return this.token
    }
    
    this.token = storedToken
    return this.token
  }

  validateToken(token) {
    if (!token || typeof token !== 'string') {
      return false
    }
    
    // Constant-time comparison to prevent timing attacks
    const expectedToken = this.getToken()
    if (token.length !== expectedToken.length) {
      return false
    }
    
    let result = 0
    for (let i = 0; i < token.length; i++) {
      result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i)
    }
    
    return result === 0
  }

  addToHeaders(headers = {}) {
    return {
      ...headers,
      'X-CSRF-Token': this.getToken(),
      'X-Requested-With': 'XMLHttpRequest'
    }
  }

  addToFormData(formData) {
    if (formData instanceof FormData) {
      formData.append('_csrf', this.getToken())
      formData.append('_timestamp', Date.now().toString())
    }
    return formData
  }

  createHiddenInput() {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = '_csrf'
    input.value = SecurityUtils.sanitizeInput(this.getToken())
    return input
  },
  
  // Double submit cookie pattern
  setDoubleSubmitCookie() {
    const token = this.getToken()
    document.cookie = `csrf-token=${token}; SameSite=Strict; Secure; Path=/`
  },
  
  // Verify double submit pattern
  verifyDoubleSubmit() {
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrf-token='))
      ?.split('=')[1]
    
    return this.validateToken(cookieToken)
  }
}

const csrfProtection = new CSRFProtection()

// Initialize double submit cookie on load
if (typeof window !== 'undefined') {
  csrfProtection.setDoubleSubmitCookie()
}

export default csrfProtection