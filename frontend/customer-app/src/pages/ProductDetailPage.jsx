import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  HeartIcon, 
  ShareIcon, 
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  CubeIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { productService } from '../services/productService'
import { useCartStore } from '../store/cartStore'
import { useWebSocket } from '../hooks/useWebSocket'
import DeliveryEstimate from '../components/location/DeliveryEstimate'
import toast from 'react-hot-toast'

const ProductDetailPage = () => {
  const { id } = useParams()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  
  const { addItem } = useCartStore()
  const { trackActivity } = useWebSocket()

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  })

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', id],
    queryFn: () => productService.getRecommendations(null, id),
    enabled: !!id,
  })

  useEffect(() => {
    if (id) {
      trackActivity({ type: 'product_view', productId: id })
      productService.trackProductView(id)
    }
  }, [id, trackActivity])

  const handleAddToCart = async () => {
    if (!product?.data) return
    
    const result = await addItem(product.data, quantity)
    if (result.success) {
      toast.success('Added to cart!')
      trackActivity({ type: 'add_to_cart', productId: id, quantity })
    } else {
      toast.error('Failed to add to cart')
    }
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    trackActivity({ 
      type: isWishlisted ? 'remove_from_wishlist' : 'add_to_wishlist', 
      productId: id 
    })
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="shimmer h-96 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="shimmer h-8 rounded"></div>
              <div className="shimmer h-6 rounded w-3/4"></div>
              <div className="shimmer h-12 rounded w-1/2"></div>
              <div className="shimmer h-32 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const productData = product?.data

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-4">
              <img
                src={productData?.images?.[selectedImage] || '/api/placeholder/600/600'}
                alt={productData?.name}
                className="w-full h-96 object-cover rounded-xl"
              />
              
              {/* AR/VR Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-6 right-6 bg-primary-500 text-white p-3 rounded-full shadow-lg"
              >
                <CubeIcon className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Image Thumbnails */}
            <div className="flex space-x-2 overflow-x-auto">
              {productData?.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index 
                      ? 'border-primary-500' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${productData.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {productData?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Brand: {productData?.brand}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {Array(5).fill(0).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(productData?.rating || 0) 
                        ? 'fill-current' 
                        : ''
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({productData?.reviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-primary-600">
                ₹{productData?.price?.toLocaleString()}
              </span>
              {productData?.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ₹{productData.originalPrice.toLocaleString()}
                </span>
              )}
              {productData?.discount && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-lg text-sm font-semibold">
                  {productData.discount}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {productData?.description}
              </p>
            </div>

            {/* Variants */}
            {productData?.variants && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Options</h3>
                <div className="flex flex-wrap gap-2">
                  {productData.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-lg font-semibold w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="flex-1 btn-primary"
              >
                Add to Cart
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWishlist}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {isWishlisted ? (
                  <HeartSolid className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6" />
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ShareIcon className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Delivery Estimate */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <DeliveryEstimate productId={productData?.id} className="mb-4" />
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <HeartIcon className="h-5 w-5 text-red-500" />
                <span className="text-sm">Easy Returns</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm">Quality Assured</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recommendations */}
        {recommendations?.data && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold mb-8">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.data.slice(0, 4).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-4"
                >
                  <img
                    src={item.image || '/api/placeholder/300/300'}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                  <h3 className="font-semibold mb-2 line-clamp-2">{item.name}</h3>
                  <p className="text-primary-600 font-bold">
                    ₹{item.price?.toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage