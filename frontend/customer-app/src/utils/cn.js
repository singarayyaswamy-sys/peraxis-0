import { clsx } from 'clsx'

/**
 * Utility function to merge class names with clsx
 * Provides a consistent way to handle conditional classes
 * 
 * @param {...any} inputs - Class names to merge
 * @returns {string} Merged class names
 */
export function cn(...inputs) {
  return clsx(inputs)
}

/**
 * Utility to merge Tailwind classes with proper precedence
 * Handles conflicts between similar utility classes
 * 
 * @param {string} baseClasses - Base classes
 * @param {string} overrideClasses - Override classes
 * @returns {string} Merged classes with proper precedence
 */
export function mergeClasses(baseClasses, overrideClasses) {
  if (!overrideClasses) return baseClasses
  if (!baseClasses) return overrideClasses
  
  const base = baseClasses.split(' ')
  const override = overrideClasses.split(' ')
  
  // Simple conflict resolution for common Tailwind patterns
  const conflicts = {
    // Spacing
    'p-': /^p-/,
    'px-': /^px-/,
    'py-': /^py-/,
    'pt-': /^pt-/,
    'pr-': /^pr-/,
    'pb-': /^pb-/,
    'pl-': /^pl-/,
    'm-': /^m-/,
    'mx-': /^mx-/,
    'my-': /^my-/,
    'mt-': /^mt-/,
    'mr-': /^mr-/,
    'mb-': /^mb-/,
    'ml-': /^ml-/,
    
    // Colors
    'bg-': /^bg-/,
    'text-': /^text-/,
    'border-': /^border-(?!t-|r-|b-|l-|x-|y-)/,
    
    // Sizing
    'w-': /^w-/,
    'h-': /^h-/,
    'min-w-': /^min-w-/,
    'min-h-': /^min-h-/,
    'max-w-': /^max-w-/,
    'max-h-': /^max-h-/,
    
    // Display
    'block': /^(block|inline|inline-block|flex|inline-flex|grid|inline-grid|hidden)$/,
    'flex': /^flex$/,
    'grid': /^grid$/,
    'hidden': /^hidden$/,
    
    // Position
    'static': /^(static|fixed|absolute|relative|sticky)$/,
    
    // Flexbox
    'justify-': /^justify-/,
    'items-': /^items-/,
    'flex-': /^flex-(?!shrink|grow)/,
    
    // Grid
    'grid-cols-': /^grid-cols-/,
    'grid-rows-': /^grid-rows-/,
    'col-': /^col-/,
    'row-': /^row-/,
    
    // Border radius
    'rounded': /^rounded/,
    
    // Shadow
    'shadow': /^shadow/,
    
    // Opacity
    'opacity-': /^opacity-/,
    
    // Z-index
    'z-': /^z-/,
  }
  
  const result = [...base]
  
  override.forEach(overrideClass => {
    let hasConflict = false
    
    // Check for conflicts
    for (const [prefix, pattern] of Object.entries(conflicts)) {
      if (pattern.test(overrideClass)) {
        // Remove conflicting classes from base
        for (let i = result.length - 1; i >= 0; i--) {
          if (pattern.test(result[i])) {
            result.splice(i, 1)
            hasConflict = true
          }
        }
        break
      }
    }
    
    // Add the override class
    result.push(overrideClass)
  })
  
  return result.join(' ')
}

/**
 * Conditional class utility
 * 
 * @param {string} baseClass - Base class
 * @param {boolean} condition - Condition to check
 * @param {string} trueClass - Class to add if condition is true
 * @param {string} falseClass - Class to add if condition is false
 * @returns {string} Conditional classes
 */
export function conditionalClass(baseClass, condition, trueClass, falseClass = '') {
  return cn(baseClass, condition ? trueClass : falseClass)
}

/**
 * Responsive class utility
 * 
 * @param {Object} classes - Object with breakpoint keys and class values
 * @returns {string} Responsive classes
 */
export function responsiveClass(classes) {
  const breakpoints = ['', 'sm:', 'md:', 'lg:', 'xl:', '2xl:']
  const result = []
  
  Object.entries(classes).forEach(([breakpoint, className]) => {
    if (className) {
      const prefix = breakpoints.includes(breakpoint + ':') ? breakpoint + ':' : ''
      result.push(prefix + className)
    }
  })
  
  return result.join(' ')
}

/**
 * Variant class utility for component variants
 * 
 * @param {Object} variants - Variant definitions
 * @param {Object} props - Component props
 * @param {string} defaultVariant - Default variant key
 * @returns {string} Variant classes
 */
export function variantClass(variants, props, defaultVariant = 'default') {
  const variantKey = props.variant || defaultVariant
  const sizeKey = props.size || 'md'
  
  const baseClasses = variants.base || ''
  const variantClasses = variants.variants?.[variantKey] || ''
  const sizeClasses = variants.sizes?.[sizeKey] || ''
  
  return cn(baseClasses, variantClasses, sizeClasses)
}

/**
 * Focus class utility for accessibility
 * 
 * @param {string} baseClasses - Base classes
 * @param {string} focusClasses - Focus-specific classes
 * @returns {string} Classes with focus states
 */
export function focusClass(baseClasses, focusClasses = 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2') {
  return cn(baseClasses, focusClasses)
}

/**
 * Dark mode class utility
 * 
 * @param {string} lightClasses - Light mode classes
 * @param {string} darkClasses - Dark mode classes
 * @returns {string} Classes with dark mode variants
 */
export function darkClass(lightClasses, darkClasses) {
  const darkPrefixed = darkClasses.split(' ').map(cls => `dark:${cls}`).join(' ')
  return cn(lightClasses, darkPrefixed)
}

/**
 * Animation class utility
 * 
 * @param {string} baseClasses - Base classes
 * @param {Object} animations - Animation options
 * @returns {string} Classes with animations
 */
export function animationClass(baseClasses, animations = {}) {
  const {
    hover = '',
    focus = '',
    active = '',
    transition = 'transition-all duration-200'
  } = animations
  
  const hoverClasses = hover ? hover.split(' ').map(cls => `hover:${cls}`).join(' ') : ''
  const focusClasses = focus ? focus.split(' ').map(cls => `focus:${cls}`).join(' ') : ''
  const activeClasses = active ? active.split(' ').map(cls => `active:${cls}`).join(' ') : ''
  
  return cn(baseClasses, transition, hoverClasses, focusClasses, activeClasses)
}

export default cn