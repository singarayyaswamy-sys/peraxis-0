import { motion } from 'framer-motion'
import { forwardRef } from 'react'

const ModernCard = forwardRef(({ 
  children, 
  className = '', 
  hover = true,
  glow = false,
  gradient = false,
  onClick,
  ...props 
}, ref) => {
  const baseClasses = 'card relative overflow-hidden'
  const hoverClasses = hover ? 'hover-lift cursor-pointer' : ''
  const glowClasses = glow ? 'neon-glow' : ''
  const gradientClasses = gradient ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900' : ''

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      transition={{ duration: 0.3 }}
      className={`${baseClasses} ${hoverClasses} ${glowClasses} ${gradientClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  )
})

ModernCard.displayName = 'ModernCard'

export default ModernCard
