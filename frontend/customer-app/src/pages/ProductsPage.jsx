import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { 
  FunnelIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline'
import { productService } from '../services/productService'
import { useWebSocket } from '../hooks/useWebSocket'

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brand: searchParams.get('brand') || '',
    rating: searchParams.get('rating') || '',
    sortBy: searchParams.get('sortBy') || 'relevance'
  })
  
  const { trackActivity } = useWebSocket()

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
    staleTime: 30 * 60 * 1000,
  })

  useEffect(() => {
    trackActivity({ type: 'page_view', page: 'products', filters })
  }, [filters, trackActivity])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Update URL params
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    setSearchParams(params)
  }

  const ProductCard = ({ product, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`card p-4 group cursor-pointer ${
        viewMode === 'list' ? 'flex space-x-4' : ''
      }`}
    >
      <div className={`relative overflow-hidden rounded-xl ${
        viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'mb-4'
      }`}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={`object-cover group-hover:scale-110 transition-transform duration-300 ${
              viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
            }`}
          />
        ) : (
          <div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${
            viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
          }`}>
            <span className="text-gray-500 dark:text-gray-400 text-sm">Image not available</span>
          </div>
        )}
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
            {product.discount}% OFF
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg font-bold text-primary-600">
            ₹{product.price?.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex text-yellow-400">
            {'★'.repeat(Math.floor(product.rating || 4))}
          </div>
          <span className="text-sm text-gray-500">({product.reviews || 0})</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary text-sm py-2 px-4"
        >
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  )

  const SkeletonCard = () => (
    <div className="card p-4">
      <div className="shimmer h-48 rounded-xl mb-4"></div>
      <div className="shimmer h-4 rounded mb-2"></div>
      <div className="shimmer h-4 rounded w-3/4 mb-2"></div>
      <div className="shimmer h-6 rounded w-1/2 mb-3"></div>
      <div className="shimmer h-10 rounded"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Products</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {products?.data?.products?.length || 0} products found
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="input py-2 px-3 text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest First</option>
            </select>

            {/* Filter Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </motion.button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ 
              x: showFilters ? 0 : -300, 
              opacity: showFilters ? 1 : 0 
            }}
            className={`w-80 bg-white dark:bg-gray-800 rounded-2xl p-6 h-fit sticky top-24 ${
              showFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Filters
            </h3>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Categories</h4>
              <div className="space-y-2">
                {categories?.data?.data?.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={filters.category === category.id}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Price Range</h4>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="input text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="input text-sm"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Customer Rating</h4>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center">
                    <input
                      type="radio"
                      name="rating"
                      value={rating}
                      checked={filters.rating === rating.toString()}
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm flex items-center">
                      {'★'.repeat(rating)} & up
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setFilters({
                  category: '',
                  minPrice: '',
                  maxPrice: '',
                  brand: '',
                  rating: '',
                  sortBy: 'relevance'
                })
                setSearchParams({})
              }}
              className="w-full btn-secondary text-sm"
            >
              Clear All Filters
            </motion.button>
          </motion.div>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Error loading products. Please try again.</p>
              </div>
            ) : products?.data?.products?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {products.data.products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage