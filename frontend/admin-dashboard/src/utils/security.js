// Security utilities for admin dashboard
export const SecurityUtils = {
  // Generate CSRF token
  generateCSRFToken() {
    const array = new Uint32Array(2)
    crypto.getRandomValues(array)
    return array.join('') + Date.now().toString(36);
  },

  // Get CSRF token from localStorage or generate new one
  getCSRFToken() {
    let token = localStorage.getItem('csrf-token');
    if (!token) {
      token = this.generateCSRFToken();
      localStorage.setItem('csrf-token', token);
    }
    return token;
  },

  // Validate URL to prevent SSRF
  validateURL(url) {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      // Only allow localhost URLs for admin dashboard
      return urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';
    } catch (e) {
      return false;
    }
  },

  // Sanitize input to prevent XSS
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  // Validate response before processing
  validateResponse(response) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  },

  // Safe JSON parse with validation
  safeJSONParse(data) {
    try {
      const parsed = JSON.parse(data);
      
      // Basic validation - reject if contains suspicious patterns
      const jsonString = JSON.stringify(parsed);
      if (jsonString.includes('<script>') || jsonString.includes('javascript:')) {
        throw new Error('Potentially malicious JSON data');
      }
      
      return parsed;
    } catch (e) {
      throw new Error('Invalid JSON data');
    }
  },

  // Get secure headers for API requests
  getSecureHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'X-CSRF-Token': this.getCSRFToken(),
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },

  // Secure fetch wrapper
  async secureFetch(url, options = {}) {
    // Validate URL
    if (!this.validateURL(url)) {
      throw new Error('Invalid URL: Only localhost URLs are allowed');
    }

    // Add security headers
    const secureOptions = {
      ...options,
      headers: {
        ...this.getSecureHeaders(),
        ...options.headers
      }
    };

    // Make request
    const response = await fetch(url, secureOptions);
    
    // Validate response
    this.validateResponse(response);
    
    return response;
  }
};

export default SecurityUtils;