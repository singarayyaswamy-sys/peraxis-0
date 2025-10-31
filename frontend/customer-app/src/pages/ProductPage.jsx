import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
  ShareIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import SecurityUtils from '../utils/security'

const ProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await SecurityUtils.secureFetch(`http://localhost:8082/api/products/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setProduct(data.data)
        setReviews(data.data.reviews || [])
      } else {
        navigate('/products')
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    try {
      const response = await SecurityUtils.secureFetch('http://localhost:8083/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // Show success message
        alert('Product added to cart!')
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const toggleWishlist = async () => {
    try {
      const response = await SecurityUtils.secureFetch('http://localhost:8081/api/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setIsWishlisted(!isWishlisted)
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <button 
            onClick={() => navigate('/products')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                <img
                  src={product.images?.[selectedImage] || '/api/placeholder/600/600'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              {product.images?.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-indigo-600' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-gray-600 mt-2">{product.brand}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({reviews.length} reviews)
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{product.price?.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-green-600 font-medium">
                    Save ₹{(product.originalPrice - product.price).toLocaleString()} 
                    ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off)
                  </div>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed">{product.description}</p>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1"
                  >
                    {[...Array(Math.min(10, product.stock || 1))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
                
                <button
                  onClick={toggleWishlist}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                >
                  {isWishlisted ? (
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 text-gray-600" />
                  )}
                </button>
                
                <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                  <ShareIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <TruckIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-700">Free delivery on orders over ₹500</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-700">1 year warranty included</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="border-t p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
              <div className="space-y-6">
                {reviews.slice(0, 3).map((review, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-gray-900">{review.userName}</span>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductPage