import { forwardRef, memo } from 'react'
import { motion } from 'framer-motion'
import { ButtonLoader } from './LoadingSpinner'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'

// Button variants using class-variance-authority for better maintainability
const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500",
        secondary: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm hover:shadow-md focus:ring-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600",
        outline: "border-2 border-current bg-transparent hover:bg-current hover:text-white focus:ring-current",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-300",
        link: "bg-transparent text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline focus:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300",
        destructive: "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500",
        success: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500",
        warning: "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-lg hover:shadow-xl focus:ring-white/50",
        neon: "bg-transparent border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white shadow-lg hover:shadow-blue-500/50 focus:ring-blue-500 neon-glow",
        gradient: "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl focus:ring-purple-500 animate-gradient bg-[length:200%_200%]"
      },
      size: {
        xs: "h-7 px-2 text-xs rounded-md",
        sm: "h-8 px-3 text-sm rounded-lg",
        md: "h-10 px-4 text-sm rounded-lg",
        lg: "h-12 px-6 text-base rounded-xl",
        xl: "h-14 px-8 text-lg rounded-xl",
        "2xl": "h-16 px-10 text-xl rounded-2xl"
      },
      fullWidth: {
        true: "w-full",
        false: ""
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        full: "rounded-full"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
      rounded: "lg"
    }
  }
)

// Enhanced Button component with motion and accessibility
const Button = forwardRef(({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  rounded,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  onClick,
  type = "button",
  animate = true,
  ripple = true,
  ...props
}, ref) => {
  const isDisabled = disabled || loading

  const handleClick = (e) => {
    if (isDisabled) {
      e.preventDefault()
      return
    }
    
    // Ripple effect
    if (ripple && e.currentTarget) {
      const button = e.currentTarget
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      const rippleElement = document.createElement('span')
      rippleElement.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        z-index: 1;
      `
      
      button.appendChild(rippleElement)
      
      setTimeout(() => {
        rippleElement.remove()
      }, 600)
    }
    
    onClick?.(e)
  }

  const buttonContent = (
    <>
      {/* Shimmer effect for gradient buttons */}
      {(variant === 'primary' || variant === 'gradient') && (
        <div className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-shimmer" />
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ButtonLoader 
            size={size === 'xs' || size === 'sm' ? 'xs' : 'sm'} 
            color={variant === 'secondary' || variant === 'ghost' ? 'gray' : 'white'} 
          />
        </div>
      )}
      
      {/* Button content */}
      <div className={`flex items-center space-x-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
        {leftIcon && (
          <span className="flex-shrink-0">
            {leftIcon}
          </span>
        )}
        
        {children && (
          <span className="truncate">
            {children}
          </span>
        )}
        
        {rightIcon && (
          <span className="flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </div>
    </>
  )

  const ButtonComponent = animate ? motion.button : 'button'
  const motionProps = animate ? {
    whileHover: isDisabled ? {} : { 
      scale: 1.02,
      y: -1
    },
    whileTap: isDisabled ? {} : { 
      scale: 0.98,
      y: 0
    },
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  } : {}

  return (
    <ButtonComponent
      ref={ref}
      type={type}
      className={cn(
        buttonVariants({ variant, size, fullWidth, rounded }),
        className
      )}
      disabled={isDisabled}
      onClick={handleClick}
      {...motionProps}
      {...props}
    >
      {buttonContent}
    </ButtonComponent>
  )
})

Button.displayName = 'Button'

// Specialized button components
export const IconButton = memo(forwardRef(({
  icon,
  size = "md",
  variant = "ghost",
  className,
  ...props
}, ref) => {
  const sizeClasses = {
    xs: "w-7 h-7",
    sm: "w-8 h-8", 
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-14 h-14"
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      className={cn(
        sizeClasses[size],
        "p-0 flex-shrink-0",
        className
      )}
      {...props}
    >
      {icon}
    </Button>
  )
}))

IconButton.displayName = 'IconButton'

export const FloatingActionButton = memo(forwardRef(({
  icon,
  className,
  ...props
}, ref) => (
  <Button
    ref={ref}
    variant="primary"
    size="lg"
    rounded="full"
    className={cn(
      "fixed bottom-6 right-6 w-14 h-14 p-0 shadow-2xl hover:shadow-3xl z-50 neon-glow",
      className
    )}
    {...props}
  >
    {icon}
  </Button>
)))

FloatingActionButton.displayName = 'FloatingActionButton'

export const ButtonGroup = memo(({ children, className, orientation = "horizontal" }) => (
  <div 
    className={cn(
      "inline-flex",
      orientation === "horizontal" ? "flex-row" : "flex-col",
      "[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg",
      orientation === "vertical" && "[&>button:first-child]:rounded-t-lg [&>button:first-child]:rounded-l-none [&>button:last-child]:rounded-b-lg [&>button:last-child]:rounded-r-none",
      "[&>button:not(:first-child)]:border-l-0",
      orientation === "vertical" && "[&>button:not(:first-child)]:border-l [&>button:not(:first-child)]:border-t-0",
      className
    )}
    role="group"
  >
    {children}
  </div>
))

ButtonGroup.displayName = 'ButtonGroup'

export const ToggleButton = memo(forwardRef(({
  pressed = false,
  onPressedChange,
  variant = "outline",
  className,
  children,
  ...props
}, ref) => {
  const handleClick = (e) => {
    onPressedChange?.(!pressed)
    props.onClick?.(e)
  }

  return (
    <Button
      ref={ref}
      variant={pressed ? "primary" : variant}
      className={cn(
        "data-[pressed=true]:bg-blue-600 data-[pressed=true]:text-white",
        className
      )}
      data-pressed={pressed}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  )
}))

ToggleButton.displayName = 'ToggleButton'

// Add ripple animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    @keyframes shimmer {
      0% {
        transform: translateX(-100%) skewX(-12deg);
      }
      100% {
        transform: translateX(200%) skewX(-12deg);
      }
    }
  `
  document.head.appendChild(style)
}

export default Button