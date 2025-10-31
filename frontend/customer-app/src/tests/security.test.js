import { describe, it, expect, beforeEach, vi } from 'vitest'
import SecurityUtils from '../utils/security'

describe('SecurityUtils', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('sanitizeInput', () => {
    it('should remove dangerous HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = SecurityUtils.sanitizeInput(input)
      expect(result).toBe('Hello')
    })

    it('should remove javascript protocols', () => {
      const input = 'javascript:alert("xss")'
      const result = SecurityUtils.sanitizeInput(input)
      expect(result).toBe('')
    })

    it('should remove event handlers', () => {
      const input = 'onclick=alert("xss")'
      const result = SecurityUtils.sanitizeInput(input)
      expect(result).toBe('')
    })
  })

  describe('validateURL', () => {
    it('should allow localhost URLs', () => {
      expect(SecurityUtils.validateURL('http://localhost:8080/api')).toBe(true)
    })

    it('should reject external URLs', () => {
      expect(SecurityUtils.validateURL('http://evil.com/api')).toBe(false)
    })
  })

  describe('CSRF Token Management', () => {
    it('should generate CSRF token', () => {
      const token = SecurityUtils.generateCSRFToken()
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })
  })
})