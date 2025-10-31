import DOMPurify from 'dompurify';

// Enhanced Security utilities for customer app
export const SecurityUtils = {
  // Generate cryptographically secure CSRF token
  generateCSRFToken() {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback with crypto.getRandomValues
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  },

  // Get CSRF token with secure storage and expiration
  getCSRFToken() {
    const token = sessionStorage.getItem('csrf-token');
    const expiry = sessionStorage.getItem('csrf-token-expiry');
    
    if (!token || (expiry && Date.now() > parseInt(expiry))) {
      return this.refreshCSRFToken();
    }
    
    return token;
  },

  // Refresh CSRF token with shorter expiration
  refreshCSRFToken() {
    const token = this.generateCSRFToken();
    const expiration = Date.now() + (2 * 60 * 60 * 1000); // 2 hours
    
    sessionStorage.setItem('csrf-token', token);
    sessionStorage.setItem('csrf-token-expiry', expiration.toString());
    
    return token;
  },

  // Enhanced input sanitization using DOMPurify
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Use DOMPurify for comprehensive XSS protection
    const sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
    
    return sanitized
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/\$\{.*?\}/g, '')
      .replace(/\$\(.*?\)/g, '')
      .replace(/eval\s*\(/gi, '')
      .replace(/Function\s*\(/gi, '')
      .replace(/setTimeout\s*\(/gi, '')
      .replace(/setInterval\s*\(/gi, '')
      .trim();
  },

  // Comprehensive URL validation
  validateURL(url) {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const urlObj = new URL(url);
      
      // Production vs Development allowed hosts
      const isDev = import.meta.env.DEV;
      const allowedHosts = isDev 
        ? ['localhost', '127.0.0.1', 'peraxis.local', '0.0.0.0']
        : ['api.peraxis.com', 'peraxis.com', 'www.peraxis.com'];
      
      const allowedPorts = ['80', '443', '3000', '3001', '3002', '8080', '8081', '8082', '8083', '8084', '8085', '8086', '8087', '8088', '8089', '8090', '8091'];
      
      // Check protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      
      // Force HTTPS in production
      if (!isDev && urlObj.protocol !== 'https:') {
        return false;
      }
      
      // Check hostname
      if (!allowedHosts.includes(urlObj.hostname)) {
        return false;
      }
      
      // Check port if specified
      if (urlObj.port && !allowedPorts.includes(urlObj.port)) {
        return false;
      }
      
      // Block suspicious paths
      const suspiciousPaths = ['/admin', '/config', '/.env', '/wp-admin', '/phpmyadmin'];
      if (suspiciousPaths.some(path => urlObj.pathname.includes(path))) {
        return false;
      }
      
      return true;
    } catch (e) {
      return false;
    }
  },

  // Safe JSON parse with validation
  safeJSONParse(data, fallback = null) {
    try {
      if (typeof data !== 'string') return fallback;
      
      // Check for potential XSS in JSON
      const dangerousPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /eval\s*\(/gi,
        /Function\s*\(/gi
      ];
      
      if (dangerousPatterns.some(pattern => pattern.test(data))) {
        throw new Error('Potentially malicious JSON data detected');
      }
      
      const parsed = JSON.parse(data);
      
      // Recursively sanitize object values
      const sanitizeObject = (obj) => {
        if (typeof obj === 'string') {
          return this.sanitizeInput(obj);
        }
        if (Array.isArray(obj)) {
          return obj.map(sanitizeObject);
        }
        if (obj && typeof obj === 'object') {
          const sanitized = {};
          for (const [key, value] of Object.entries(obj)) {
            sanitized[this.sanitizeInput(key)] = sanitizeObject(value);
          }
          return sanitized;
        }
        return obj;
      };
      
      return sanitizeObject(parsed);
    } catch (e) {
      console.warn('JSON parse failed:', e.message);
      return fallback;
    }
  },

  // Enhanced secure fetch with comprehensive security
  async secureFetch(url, options = {}) {
    if (!this.validateURL(url)) {
      throw new Error('Invalid URL: Security policy violation');
    }

    // Rate limiting check
    const rateLimitKey = `fetch_${url}`;
    if (!this.rateLimiter.isAllowed(rateLimitKey, 30, 60000)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const secureOptions = {
      ...options,
      credentials: import.meta.env.PROD ? 'same-origin' : 'include',
      mode: 'cors',
      referrerPolicy: 'strict-origin-when-cross-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.getCSRFToken(),
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        ...options.headers
      }
    };

    // Add integrity check for state-changing requests
    if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
      if (options.body && typeof options.body === 'string') {
        try {
          const bodyData = JSON.parse(options.body);
          bodyData._csrf = this.getCSRFToken();
          bodyData._timestamp = Date.now();
          secureOptions.body = JSON.stringify(bodyData);
        } catch (e) {
          // Handle non-JSON body
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    secureOptions.signal = controller.signal;

    try {
      const response = await fetch(url, secureOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 403) {
          this.refreshCSRFToken();
          throw new Error('Authentication failed. Please refresh and try again.');
        }
        if (response.status === 429) {
          throw new Error('Too many requests. Please slow down.');
        }
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw error;
    }
  },

  // Generate secure session ID
  generateSecureSessionId() {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  },
  
  // Enhanced Content Security Policy
  setCSPHeaders() {
    if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      return; // Already set
    }
    
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for React dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' ws: wss: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "object-src 'none'",
      "media-src 'self'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    document.head.appendChild(meta);
  },
  
  // Enhanced rate limiting with sliding window
  rateLimiter: {
    requests: new Map(),
    
    isAllowed(key, maxRequests = 10, windowMs = 60000) {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }
      
      const requests = this.requests.get(key);
      const validRequests = requests.filter(time => time > windowStart);
      
      if (validRequests.length >= maxRequests) {
        return false;
      }
      
      validRequests.push(now);
      this.requests.set(key, validRequests);
      
      // Cleanup old entries periodically
      if (Math.random() < 0.01) { // 1% chance
        this.cleanup();
      }
      
      return true;
    },
    
    cleanup() {
      const now = Date.now();
      for (const [key, requests] of this.requests.entries()) {
        const validRequests = requests.filter(time => time > now - 300000); // 5 minutes
        if (validRequests.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, validRequests);
        }
      }
    }
  },
  
  // Input validation helpers
  validators: {
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    phone: (phone) => /^[+]?[1-9]?[0-9]{7,15}$/.test(phone.replace(/\s/g, '')),
    password: (password) => {
      return password.length >= 8 &&
             /[A-Z]/.test(password) &&
             /[a-z]/.test(password) &&
             /[0-9]/.test(password) &&
             /[^A-Za-z0-9]/.test(password);
    },
    url: (url) => SecurityUtils.validateURL(url),
    alphanumeric: (str) => /^[a-zA-Z0-9]+$/.test(str),
    numeric: (str) => /^[0-9]+$/.test(str)
  },
  
  // Secure storage helpers
  secureStorage: {
    set(key, value, expiry = null) {
      const data = {
        value: SecurityUtils.sanitizeInput(JSON.stringify(value)),
        expiry: expiry ? Date.now() + expiry : null
      };
      sessionStorage.setItem(key, JSON.stringify(data));
    },
    
    get(key) {
      try {
        const item = sessionStorage.getItem(key);
        if (!item) return null;
        
        const data = JSON.parse(item);
        if (data.expiry && Date.now() > data.expiry) {
          sessionStorage.removeItem(key);
          return null;
        }
        
        return SecurityUtils.safeJSONParse(data.value);
      } catch (e) {
        sessionStorage.removeItem(key);
        return null;
      }
    },
    
    remove(key) {
      sessionStorage.removeItem(key);
    },
    
    clear() {
      sessionStorage.clear();
    }
  }
};

// Initialize security measures
if (typeof window !== 'undefined') {
  SecurityUtils.setCSPHeaders();
  
  // Prevent clickjacking
  if (window.top !== window.self) {
    window.top.location = window.self.location;
  }
}

export default SecurityUtils;