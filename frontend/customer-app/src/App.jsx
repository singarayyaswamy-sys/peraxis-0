import { Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Suspense, lazy, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

// Components
import ErrorBoundary from './components/ui/ErrorBoundary'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ResponsiveLayout from './components/layout/ResponsiveLayout'
import SecurityUtils from './utils/security'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const DealsPage = lazy(() => import('./pages/DealsPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))

// Enhanced Query Client with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
})

// Enhanced Loading component with better UX
const PageLoader = ({ text = "Loading..." }) => (
  <div className="min-h-screen flex-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <LoadingSpinner size="lg" />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 dark:text-gray-400 font-medium"
      >
        {text}
      </motion.p>
    </motion.div>
  </div>
)

// Enhanced page transition variants
const pageVariants = {
  initial: { 
    opacity: 0, 
    x: -20,
    scale: 0.98
  },
  in: { 
    opacity: 1, 
    x: 0,
    scale: 1
  },
  out: { 
    opacity: 0, 
    x: 20,
    scale: 1.02
  }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
}

// Route configuration for better maintainability
const routes = [
  { path: '/', component: HomePage, title: 'Home' },
  { path: '/products', component: ProductsPage, title: 'Products' },
  { path: '/product/:id', component: ProductDetailPage, title: 'Product Details' },
  { path: '/search', component: SearchPage, title: 'Search Results' },
  { path: '/categories', component: CategoriesPage, title: 'Categories' },
  { path: '/deals', component: DealsPage, title: 'Deals & Offers' },
  { path: '/cart', component: CartPage, title: 'Shopping Cart' },
  { path: '/checkout', component: CheckoutPage, title: 'Checkout' },
  { path: '/login', component: LoginPage, title: 'Login' },
  { path: '/register', component: RegisterPage, title: 'Register' },
  { path: '/profile', component: ProfilePage, title: 'My Profile' },
  { path: '/orders', component: OrdersPage, title: 'My Orders' },
  { path: '/wishlist', component: WishlistPage, title: 'Wishlist' },
]



// Enhanced Error Fallback
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex-center bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md mx-auto"
    >
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex-center mx-auto mb-6">
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Oops! Something went wrong
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
      </p>
      <div className="space-y-3">
        <button
          onClick={resetErrorBoundary}
          className="btn-primary w-full"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="btn-secondary w-full"
        >
          Go Home
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Error Details (Development)
          </summary>
          <pre className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </motion.div>
  </div>
)

// Enhanced Toast Configuration
const toastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    padding: '12px 16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#ffffff',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#ffffff',
    },
  },
  loading: {
    iconTheme: {
      primary: '#3b82f6',
      secondary: '#ffffff',
    },
  },
}

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'navigation') {
      console.log('Page Load Time:', entry.loadEventEnd - entry.loadEventStart)
    }
  }
})

if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
  performanceObserver.observe({ entryTypes: ['navigation'] })
}

function App() {
  const location = useLocation()

  // Initialize security measures
  useEffect(() => {
    // Set security headers
    SecurityUtils.setCSPHeaders()
    
    // Initialize CSRF token
    SecurityUtils.refreshCSRFToken()
    
    // Prevent right-click in production
    if (import.meta.env.PROD) {
      const handleContextMenu = (e) => e.preventDefault()
      const handleSelectStart = (e) => e.preventDefault()
      const handleDragStart = (e) => e.preventDefault()
      
      document.addEventListener('contextmenu', handleContextMenu)
      document.addEventListener('selectstart', handleSelectStart)
      document.addEventListener('dragstart', handleDragStart)
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu)
        document.removeEventListener('selectstart', handleSelectStart)
        document.removeEventListener('dragstart', handleDragStart)
      }
    }
  }, [])

  // Preload critical routes
  useEffect(() => {
    const criticalRoutes = ['/products', '/cart', '/login']
    criticalRoutes.forEach(route => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = route
      document.head.appendChild(link)
    })
  }, [])

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <div className="App min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <ResponsiveLayout>
            <AnimatePresence mode="wait" initial={false}>
              <Routes location={location} key={location.pathname}>
                {routes.map(({ path, component: Component, title }) => (
                  <Route 
                    key={path}
                    path={path} 
                    element={
                      <Suspense fallback={<PageLoader text={`Loading ${title}...`} />}>
                        <motion.div
                          initial="initial"
                          animate="in"
                          exit="out"
                          variants={pageVariants}
                          transition={pageTransition}
                          className="min-h-screen"
                        >
                          <Component />
                        </motion.div>
                      </Suspense>
                    } 
                  />
                ))}
                
                <Route 
                  path="*" 
                  element={
                    <Suspense fallback={<PageLoader text="Loading..." />}>
                      <motion.div
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="min-h-screen flex-center px-4"
                      >
                        <div className="text-center max-w-md mx-auto">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex-center mx-auto mb-6">
                            <span className="text-3xl">🔍</span>
                          </div>
                          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            404
                          </h1>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            The page you're looking for doesn't exist.
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.href = '/'}
                            className="btn-primary"
                          >
                            Go Home
                          </motion.button>
                        </div>
                      </motion.div>
                    </Suspense>
                  } 
                />
              </Routes>
            </AnimatePresence>
          </ResponsiveLayout>
        </div>
        
        {/* Enhanced Toast Notifications */}
        <Toaster 
          toastOptions={toastOptions}
          containerStyle={{
            top: 20,
            right: 20,
          }}
        />
        
        {/* Development Tools */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools 
            initialIsOpen={false} 
            position="bottom-right"
            toggleButtonProps={{
              style: {
                background: 'rgba(59, 130, 246, 0.9)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '500',
                padding: '8px 12px',
              }
            }}
          />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App