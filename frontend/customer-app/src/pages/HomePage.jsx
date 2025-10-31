import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { 
  ArrowRightIcon, 
  SparklesIcon, 
  FireIcon,
  GiftIcon,
  TruckIcon,
  ShieldCheckIcon,
  StarIcon,
  HeartIcon,
  EyeIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline'
import { productService } from '../services/productService'
import { useWebSocket } from '../hooks/useWebSocket'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import activityService from '../services/activityService'
import SecurityUtils from '../utils/security'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'

const HomePage = () => {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const { trackActivity } = useWebSocket()
  const { user } = useAuthStore()
  const { addItem } = useCartStore()

  // Intersection observers for animations
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [productsRef, productsInView] = useInView({ threshold: 0.1, triggerOnce: true })

  // Enhanced data fetching with error handling
  const { data: featuredProducts, isLoading: featuredLoading, error: featuredError } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productService.getFeaturedProducts(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  const { data: trendingProducts, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-products'],
    queryFn: () => productService.getTrendingProducts(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })

  const { data: deals, isLoading: dealsLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => productService.getDeals(),
    staleTime: 2 * 60 * 1000,
    retry: 3,
  })

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => productService.getRecommendations(user?.id),
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  })

  // Enhanced activity logging with security
  const logPageView = useCallback(async () => {
    try {
      if (user?.id) {
        const sanitizedUserId = SecurityUtils.sanitizeInput(user.id)
        await activityService.logPageView('homepage', sanitizedUserId)
      }
      trackActivity({ type: 'page_view', page: 'home', timestamp: Date.now() })
    } catch (error) {
      console.warn('Failed to log page view:', error.message)
    }
  }, [trackActivity, user])

  useEffect(() => {
    logPageView()
  }, [logPageView])

  // Enhanced banner auto-rotation with pause on hover
  useEffect(() => {
    if (!isAutoPlay) return
    
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 6000)
    
    return () => clearInterval(interval)
  }, [isAutoPlay])

  // Enhanced banner data with better content
  const banners = useMemo(() => [
    {
      id: 1,
      title: "AI-Powered Shopping Revolution",
      subtitle: "Experience the future of e-commerce with personalized recommendations",
      image: "/api/placeholder/1200/500",
      cta: "Explore AI Features",
      link: "/products",
      gradient: "from-purple-600 via-blue-600 to-cyan-500"
    },
    {
      id: 2,
      title: "Mega Flash Sale - Up to 80% Off",
      subtitle: "Limited time offers on premium brands and trending products",
      image: "/api/placeholder/1200/500",
      cta: "Shop Flash Deals",
      link: "/deals",
      gradient: "from-red-500 via-pink-500 to-orange-500"
    },
    {
      id: 3,
      title: "AR Product Preview",
      subtitle: "See how products look in your space before you buy",
      image: "/api/placeholder/1200/500",
      cta: "Try AR Experience",
      link: "/ar-products",
      gradient: "from-green-500 via-teal-500 to-blue-500"
    },
    {
      id: 4,
      title: "Premium Member Benefits",
      subtitle: "Free shipping, exclusive deals, and priority support",
      image: "/api/placeholder/1200/500",
      cta: "Join Premium",
      link: "/premium",
      gradient: "from-yellow-500 via-orange-500 to-red-500"
    }
  ], [])

  // Enhanced features with modern icons and descriptions
  const features = useMemo(() => [
    {
      icon: TruckIcon,
      title: "Lightning Fast Delivery",
      description: "Same-day delivery in metro cities, free shipping on orders above ₹499",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: ShieldCheckIcon,
      title: "Bank-Grade Security",
      description: "256-bit SSL encryption, secure payments, and fraud protection",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: GiftIcon,
      title: "Hassle-Free Returns",
      description: "30-day return policy with free pickup and instant refunds",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    }
  ], [])

  // Enhanced product card with modern design
  const ProductCard = ({ product, index, section }) => {
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    const handleAddToCart = useCallback(async (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      try {
        await addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        })
        
        trackActivity({ 
          type: 'add_to_cart', 
          productId: product.id,
          section,
          timestamp: Date.now()
        })
      } catch (error) {
        console.warn('Failed to add to cart:', error.message)
      }
    }, [product, addItem, trackActivity, section])

    const handleProductClick = useCallback(() => {
      trackActivity({ 
        type: 'product_click', 
        productId: product.id,
        section,
        timestamp: Date.now()
      })
      
      if (user?.id) {
        activityService.logProductView(product.id, user.id).catch(console.warn)
      }
    }, [product.id, trackActivity, section, user?.id])

    const handleWishlistToggle = useCallback((e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsWishlisted(!isWishlisted)
      
      trackActivity({ 
        type: isWishlisted ? 'remove_from_wishlist' : 'add_to_wishlist',
        productId: product.id,
        timestamp: Date.now()
      })
    }, [isWishlisted, product.id, trackActivity])

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="card group cursor-pointer relative overflow-hidden"
        onClick={handleProductClick}
      >
        <Link to={`/product/${product.id}`} className="block">
          {/* Image Container */}
          <div className="relative overflow-hidden rounded-xl mb-4 aspect-square">
            {!imageLoaded && (
              <div className="absolute inset-0 shimmer rounded-xl" />
            )}
            <img
              src={product.image || '/api/placeholder/300/300'}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            
            {/* Discount Badge */}
            {product.discount && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
              >
                {product.discount}% OFF
              </motion.div>
            )}

            {/* Wishlist Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlistToggle}
              className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                isWishlisted 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <HeartIcon className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </motion.button>

            {/* Quick View Button */}
            <motion.button
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 hover:text-blue-500 transition-all duration-300"
            >
              <EyeIcon className="h-5 w-5" />
            </motion.button>

            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Product Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating || 4)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.reviews || 0})</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ₹{product.price?.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-sm text-green-600 font-medium">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              className="w-full btn-primary text-sm py-3 flex items-center justify-center space-x-2"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              <span>Add to Cart</span>
            </motion.button>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Enhanced skeleton loader
  const SkeletonCard = () => (
    <div className="card p-4 space-y-4">
      <div className="aspect-square shimmer rounded-xl" />
      <div className="space-y-2">
        <div className="shimmer h-4 rounded w-3/4" />
        <div className="shimmer h-4 rounded w-1/2" />
        <div className="shimmer h-6 rounded w-2/3" />
        <div className="shimmer h-10 rounded" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Banner */}
      <section 
        ref={heroRef}
        className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden"
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
      >
        <AnimatePresence mode="wait">
          {banners.map((banner, index) => (
            index === currentBanner && (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className={`absolute inset-0 bg-gradient-to-br ${banner.gradient}`}
              >
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative h-full flex items-center justify-center text-center text-white px-4">
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                  >
                    <motion.h1 
                      className="heading-1 mb-6 gradient-text"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      {banner.title}
                    </motion.h1>
                    <motion.p 
                      className="body-large mb-8 opacity-90 max-w-2xl mx-auto"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                    >
                      {banner.subtitle}
                    </motion.p>
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.6 }}
                    >
                      <Link to={banner.link}>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn-ghost text-lg px-8 py-4 flex items-center space-x-3 mx-auto neon-glow"
                        >
                          <span>{banner.cta}</span>
                          <ArrowRightIcon className="h-5 w-5" />
                        </motion.button>
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Enhanced Banner Navigation */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {banners.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentBanner(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentBanner 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
        >
          <ArrowRightIcon className="h-6 w-6 text-white rotate-180" />
        </button>
        <button
          onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
        >
          <ArrowRightIcon className="h-6 w-6 text-white" />
        </button>
      </section>

      {/* Enhanced Features Section */}
      <section ref={featuresRef} className="section-padding bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="text-center group"
              >
                <div className={`w-20 h-20 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-10 w-10 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Recommendations Section */}
      {user && recommendations?.data && (
        <section className="section-padding">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="flex items-center justify-center space-x-3 mb-6">
                <SparklesIcon className="h-8 w-8 text-purple-500 animate-pulse-slow" />
                <h2 className="heading-2 gradient-text">Curated Just for You</h2>
                <SparklesIcon className="h-8 w-8 text-purple-500 animate-pulse-slow" />
              </div>
              <p className="body-large text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Our AI analyzes your preferences, browsing history, and purchase patterns to recommend products you'll love
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {(Array.isArray(recommendations?.data) ? recommendations.data : []).slice(0, 8).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} section="recommendations" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Flash Deals Section */}
      <section className="section-padding bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 dark:from-red-900/20 dark:via-pink-900/20 dark:to-orange-900/20">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <FireIcon className="h-8 w-8 text-red-500 animate-bounce-gentle" />
              <h2 className="heading-2 text-red-600 dark:text-red-400">Flash Deals</h2>
              <FireIcon className="h-8 w-8 text-red-500 animate-bounce-gentle" />
            </div>
            <p className="body-large text-gray-600 dark:text-gray-400">
              Limited time offers - Grab them before they're gone!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {dealsLoading
              ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : (Array.isArray(deals?.data) ? deals.data : []).slice(0, 8).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} section="deals" />
                ))
            }
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/deals">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-8 py-4"
              >
                View All Flash Deals
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section ref={productsRef} className="section-padding">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={productsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="heading-2 gradient-text mb-6">Featured Products</h2>
            <p className="body-large text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Handpicked premium products from top brands, curated by our experts
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredLoading
              ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : (Array.isArray(featuredProducts?.data) ? featuredProducts.data : []).slice(0, 8).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} section="featured" />
                ))
            }
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="section-padding bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="heading-2 gradient-text mb-6">Trending Now</h2>
            <p className="body-large text-gray-600 dark:text-gray-400">
              What's hot and popular among our community of shoppers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingLoading
              ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : (Array.isArray(trendingProducts?.data) ? trendingProducts.data : []).slice(0, 8).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} section="trending" />
                ))
            }
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage