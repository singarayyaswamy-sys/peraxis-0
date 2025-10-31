import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  HeartIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useThemeStore } from '../../store/themeStore'
import { useLocationStore } from '../../store/locationStore'
import { useWebSocket } from '../../hooks/useWebSocket'
import LocationDisplay from '../location/LocationDisplay'
import LocationModal from '../location/LocationModal'
import SecurityUtils from '../../utils/security'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const { user, isAuthenticated, logout } = useAuthStore()
  const { itemCount, totalAmount } = useCartStore()
  const { isDark, toggleTheme } = useThemeStore()
  const { currentLocation, openLocationModal } = useLocationStore()
  const { trackActivity, isConnected } = useWebSocket()

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false)
        setSearchSuggestions([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Enhanced search with debouncing and suggestions
  const handleSearchInput = useCallback(async (value) => {
    const sanitizedValue = SecurityUtils.sanitizeInput(value)
    setSearchQuery(sanitizedValue)
    
    if (sanitizedValue.length > 2) {
      setIsSearching(true)
      try {
        // Simulate search suggestions API call
        await new Promise(resolve => setTimeout(resolve, 300))
        const mockSuggestions = [
          `${sanitizedValue} products`,
          `${sanitizedValue} deals`,
          `${sanitizedValue} brands`,
          `${sanitizedValue} categories`
        ].slice(0, 4)
        setSearchSuggestions(mockSuggestions)
      } catch (error) {
        console.warn('Search suggestions failed:', error.message)
      } finally {
        setIsSearching(false)
      }
    } else {
      setSearchSuggestions([])
    }
  }, [])

  // Enhanced search submission
  const handleSearch = useCallback((e, suggestion = null) => {
    e.preventDefault()
    const query = suggestion || searchQuery.trim()
    
    if (query) {
      const sanitizedQuery = SecurityUtils.sanitizeInput(query)
      trackActivity({ 
        type: 'search', 
        query: sanitizedQuery,
        timestamp: Date.now(),
        source: suggestion ? 'suggestion' : 'manual'
      })
      navigate(`/search?q=${encodeURIComponent(sanitizedQuery)}`)
      setSearchQuery('')
      setIsSearchFocused(false)
      setSearchSuggestions([])
    }
  }, [searchQuery, trackActivity, navigate])

  // Enhanced logout with cleanup
  const handleLogout = useCallback(async () => {
    try {
      await logout()
      setIsProfileOpen(false)
      trackActivity({ type: 'logout', timestamp: Date.now() })
      navigate('/')
    } catch (error) {
      console.warn('Logout failed:', error.message)
    }
  }, [logout, trackActivity, navigate])

  // Navigation items
  const navigationItems = [
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
    { name: 'Categories', href: '/categories', icon: Bars3Icon },
    { name: 'Deals', href: '/deals', icon: SparklesIcon },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-white/20 dark:border-gray-700/50">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-pink-500 to-red-500 rounded-full animate-pulse" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold gradient-text group-hover:animate-gradient">
                  Peraxis
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  Smart Shopping
                </p>
              </div>
            </Link>

            {/* Enhanced Search Bar */}
            <div className="flex-1 max-w-2xl mx-4 lg:mx-8" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <motion.div
                  animate={{
                    scale: isSearchFocused ? 1.02 : 1,
                    boxShadow: isSearchFocused 
                      ? '0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)' 
                      : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="Search products, brands, categories..."
                    className="w-full pl-12 pr-4 py-3 lg:py-4 rounded-2xl border border-gray-300/50 dark:border-gray-600/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                  />
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="loading-spinner w-5 h-5 text-blue-500" />
                    </div>
                  )}
                </motion.div>

                {/* Search Suggestions */}
                <AnimatePresence>
                  {isSearchFocused && searchSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-50"
                    >
                      {searchSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                          onClick={(e) => handleSearch(e, suggestion)}
                          className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-3"
                        >
                          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                          <span>{suggestion}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                    location.pathname === item.href
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Location */}
              <div className="hidden md:block">
                <LocationDisplay />
              </div>

              {/* Connection Status */}
              <motion.div
                animate={{ scale: isConnected ? 1 : 0.8 }}
                className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                } shadow-lg`}
                title={isConnected ? 'Connected' : 'Disconnected'}
              />

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 lg:p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SunIcon className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MoonIcon className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600 dark:text-gray-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Notifications */}
              {isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 lg:p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors relative"
                >
                  <BellIcon className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600 dark:text-gray-300" />
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                  >
                    3
                  </motion.span>
                </motion.button>
              )}

              {/* Wishlist */}
              <Link to="/wishlist">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 lg:p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors relative"
                >
                  <HeartIcon className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600 dark:text-gray-300" />
                </motion.div>
              </Link>

              {/* Enhanced Cart */}
              <Link to="/cart">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 lg:p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors relative group"
                >
                  <ShoppingCartIcon className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600 dark:text-gray-300" />
                  {itemCount > 0 && (
                    <>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                      >
                        {itemCount > 99 ? '99+' : itemCount}
                      </motion.span>
                      
                      {/* Cart Preview Tooltip */}
                      <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{totalAmount?.toLocaleString()}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </Link>

              {/* Enhanced User Profile */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-2 lg:p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors flex items-center space-x-2"
                >
                  {isAuthenticated && user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-6 w-6 lg:h-8 lg:w-8 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <UserIcon className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600 dark:text-gray-300" />
                  )}
                  {isAuthenticated && (
                    <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                  )}
                </motion.button>

                {/* Enhanced Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-50"
                    >
                      {isAuthenticated ? (
                        <>
                          {/* User Info */}
                          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                              {user?.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">
                                    {user?.name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {user?.name || 'User'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {user?.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link
                              to="/profile"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <UserCircleIcon className="h-5 w-5" />
                              <span>My Profile</span>
                            </Link>
                            <Link
                              to="/orders"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <ShoppingBagIcon className="h-5 w-5" />
                              <span>My Orders</span>
                            </Link>
                            <Link
                              to="/settings"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <Cog6ToothIcon className="h-5 w-5" />
                              <span>Settings</span>
                            </Link>
                          </div>

                          {/* Logout */}
                          <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                            >
                              <ArrowRightOnRectangleIcon className="h-5 w-5" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="py-2">
                          <Link
                            to="/login"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            Login
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            Register
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90 }}
                      animate={{ rotate: 0 }}
                      exit={{ rotate: 90 }}
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90 }}
                      animate={{ rotate: 0 }}
                      exit={{ rotate: -90 }}
                    >
                      <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-white/20 dark:border-gray-700/50 py-4"
              >
                <div className="space-y-2">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                          location.pathname === item.href
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Mobile Location */}
                  <div className="px-4 py-3">
                    <LocationDisplay />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      
      {/* Location Modal */}
      <LocationModal />
    </>
  )
}

export default Header