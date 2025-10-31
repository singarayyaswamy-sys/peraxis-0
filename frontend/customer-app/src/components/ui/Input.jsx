import { motion } from 'framer-motion'
import { useState, forwardRef } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import SecurityUtils from '../../utils/security'

const Input = forwardRef(({ 
  label,
  type = 'text',
  error,
  helperText,
  leftIcon,
  rightIcon,
  placeholder,
  className = '',
  containerClassName = '',
  sanitize = true,
  onChange,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState(false)

  const handleChange = (e) => {
    let value = e.target.value
    
    if (sanitize && typeof value === 'string') {
      value = SecurityUtils.sanitizeInput(value)
      e.target.value = value
    }
    
    if (onChange) {
      onChange(e)
    }
  }

  const inputType = type === 'password' && showPassword ? 'text' : type

  const baseClasses = `
    w-full px-4 py-3 rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${leftIcon ? 'pl-12' : ''}
    ${rightIcon || type === 'password' ? 'pr-12' : ''}
    ${error 
      ? 'border-red-300 bg-red-50 focus:ring-red-500' 
      : focused 
        ? 'border-blue-300 bg-blue-50' 
        : 'border-gray-300 bg-white hover:border-gray-400'
    }
  `

  return (
    <div className={`relative ${containerClassName}`}>
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <motion.input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          className={`${baseClasses} ${className}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}
        
        {rightIcon && type !== 'password' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}
        >
          {error || helperText}
        </motion.div>
      )}
    </div>
  )
})

export const SearchInput = ({ onSearch, placeholder = "Search...", className = '', ...props }) => {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (value) => {
    if (!value.trim()) return
    
    setIsSearching(true)
    try {
      const sanitizedQuery = SecurityUtils.sanitizeInput(value)
      await onSearch(sanitizedQuery)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
  }

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        className={className}
        leftIcon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        rightIcon={
          isSearching && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )
        }
        {...props}
      />
    </div>
  )
}

export const TextArea = forwardRef(({ 
  label,
  error,
  helperText,
  rows = 4,
  className = '',
  containerClassName = '',
  sanitize = true,
  onChange,
  ...props 
}, ref) => {
  const [focused, setFocused] = useState(false)

  const handleChange = (e) => {
    let value = e.target.value
    
    if (sanitize && typeof value === 'string') {
      value = SecurityUtils.sanitizeInput(value)
      e.target.value = value
    }
    
    if (onChange) {
      onChange(e)
    }
  }

  const baseClasses = `
    w-full px-4 py-3 rounded-lg border transition-all duration-200 resize-none
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error 
      ? 'border-red-300 bg-red-50 focus:ring-red-500' 
      : focused 
        ? 'border-blue-300 bg-blue-50' 
        : 'border-gray-300 bg-white hover:border-gray-400'
    }
  `

  return (
    <div className={`relative ${containerClassName}`}>
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </motion.label>
      )}
      
      <motion.textarea
        ref={ref}
        rows={rows}
        className={`${baseClasses} ${className}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={handleChange}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        {...props}
      />
      
      {(error || helperText) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}
        >
          {error || helperText}
        </motion.div>
      )}
    </div>
  )
})

Input.displayName = 'Input'
TextArea.displayName = 'TextArea'

export default Input