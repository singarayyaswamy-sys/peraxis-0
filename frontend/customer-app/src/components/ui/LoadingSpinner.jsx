import { motion } from 'framer-motion'
import { memo } from 'react'

// Enhanced Loading Spinner with multiple variants
const LoadingSpinner = memo(({ 
  size = 'md', 
  variant = 'default',
  text = '',
  className = '',
  color = 'primary'
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  }

  const colorClasses = {
    primary: 'text-blue-500',
    secondary: 'text-purple-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500',
    white: 'text-white',
    gray: 'text-gray-500'
  }

  const spinnerVariants = {
    default: (
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="31.416"
            strokeDashoffset="31.416"
            className="opacity-25"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="31.416"
            strokeDashoffset="23.562"
            className="opacity-75"
          />
        </svg>
      </motion.div>
    ),
    
    dots: (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 ${colorClasses[color]} bg-current rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    ),
    
    pulse: (
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]} bg-current rounded-full ${className}`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ),
    
    bars: (
      <div className={`flex space-x-1 items-end ${className}`}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`w-1 ${colorClasses[color]} bg-current rounded-full`}
            animate={{
              height: ['8px', '24px', '8px']
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    ),
    
    ripple: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            className={`absolute inset-0 border-2 ${colorClasses[color]} border-current rounded-full`}
            animate={{
              scale: [0, 1],
              opacity: [1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 1
            }}
          />
        ))}
      </div>
    ),
    
    gradient: (
      <motion.div
        className={`${sizeClasses[size]} ${className}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1">
          <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
          </div>
        </div>
      </motion.div>
    ),
    
    orbit: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className={`w-2 h-2 ${colorClasses[color]} bg-current rounded-full absolute top-0 left-1/2 transform -translate-x-1/2`} />
        </motion.div>
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <div className={`w-1.5 h-1.5 ${colorClasses[color]} bg-current rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2 opacity-60`} />
        </motion.div>
      </div>
    ),
    
    morphing: (
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]} bg-current ${className}`}
        animate={{
          borderRadius: [
            "20% 80% 80% 20%",
            "80% 20% 20% 80%",
            "20% 80% 80% 20%"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    )
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      {spinnerVariants[variant]}
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600 dark:text-gray-400 font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
})

LoadingSpinner.displayName = 'LoadingSpinner'

// Product Card Skeleton Loader
export const ProductCardSkeleton = memo(() => (
  <div className="card p-4 space-y-4 animate-pulse">
    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
))

ProductCardSkeleton.displayName = 'ProductCardSkeleton'

// Text Skeleton Loader
export const TextSkeleton = memo(({ lines = 3, className = '' }) => (
  <div className={`space-y-2 animate-pulse ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <div
        key={i}
        className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
          i === lines - 1 ? 'w-2/3' : 'w-full'
        }`}
      />
    ))}
  </div>
))

TextSkeleton.displayName = 'TextSkeleton'

// Image Skeleton Loader
export const ImageSkeleton = memo(({ className = '', aspectRatio = 'square' }) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
    '16/9': 'aspect-[16/9]'
  }

  return (
    <div className={`${aspectClasses[aspectRatio]} bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse ${className}`}>
      <div className="w-full h-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400 dark:text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  )
})

ImageSkeleton.displayName = 'ImageSkeleton'

// Full Page Loader
export const FullPageLoader = memo(({ text = 'Loading...', variant = 'gradient' }) => (
  <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex-center z-50">
    <div className="text-center space-y-4">
      <LoadingSpinner size="xl" variant={variant} />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg font-medium text-gray-700 dark:text-gray-300"
      >
        {text}
      </motion.p>
    </div>
  </div>
))

FullPageLoader.displayName = 'FullPageLoader'

// Button Loader
export const ButtonLoader = memo(({ size = 'sm', color = 'white' }) => (
  <LoadingSpinner size={size} variant="default" color={color} />
))

ButtonLoader.displayName = 'ButtonLoader'

// Inline Loader
export const InlineLoader = memo(({ text = 'Loading', variant = 'dots' }) => (
  <div className="flex items-center space-x-2">
    <LoadingSpinner size="sm" variant={variant} />
    <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
  </div>
))

InlineLoader.displayName = 'InlineLoader'

export default LoadingSpinner