import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { MagnifyingGlassIcon, MicrophoneIcon } from '@heroicons/react/24/outline'
import { productService } from '../services/productService'
import { useWebSocket } from '../hooks/useWebSocket'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [isListening, setIsListening] = useState(false)
  const { trackActivity } = useWebSocket()

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => productService.searchProducts(query),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
  })

  const { data: aiResults } = useQuery({
    queryKey: ['ai-search', query],
    queryFn: () => productService.aiSearch(query),
    enabled: !!query && query.length > 3,
    staleTime: 10 * 60 * 1000,
  })

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      trackActivity({ type: 'search', query: q })
    }
  }, [searchParams, trackActivity])

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        trackActivity({ type: 'voice_search', query: transcript })
      }

      recognition.start()
    }
  }

  const ProductCard = ({ product, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="card p-4 group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-xl mb-4">
        <img
          src={product.image || '/api/placeholder/300/300'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
            {product.discount}% OFF
          </div>
        )}
      </div>
      
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
        className="w-full btn-primary text-sm py-2"
      >
        Add to Cart
      </motion.button>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-6">Search Results</h1>
          
          {/* Enhanced Search Bar */}
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="w-full pl-12 pr-16 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            
            {/* Voice Search Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoiceSearch}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <MicrophoneIcon className="h-5 w-5" />
            </motion.button>
          </div>

          {query && (
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              {isLoading ? 'Searching...' : `${searchResults?.data?.length || 0} results for "${query}"`}
            </p>
          )}
        </motion.div>

        {/* AI Suggestions */}
        {aiResults?.data?.suggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 card p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🤖</span>
              AI Suggestions
            </h2>
            <div className="flex flex-wrap gap-2">
              {aiResults.data.suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuery(suggestion)}
                  className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm hover:bg-primary-100 transition-colors"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="shimmer h-48 rounded-xl mb-4"></div>
                <div className="shimmer h-4 rounded mb-2"></div>
                <div className="shimmer h-4 rounded w-3/4 mb-2"></div>
                <div className="shimmer h-6 rounded w-1/2 mb-3"></div>
                <div className="shimmer h-10 rounded"></div>
              </div>
            ))}
          </div>
        ) : searchResults?.data?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <h2 className="text-2xl font-bold mb-4">No results found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Try adjusting your search terms or browse our categories
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setQuery('')}
              className="btn-primary"
            >
              Clear Search
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {searchResults?.data?.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* Search Tips */}
        {!query && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 card p-8 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Search Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-semibold mb-2">🔍 Smart Search</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Use natural language like "red running shoes under 5000"
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎤 Voice Search</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Click the microphone icon to search by voice
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🤖 AI Powered</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Get intelligent suggestions and recommendations
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default SearchPage