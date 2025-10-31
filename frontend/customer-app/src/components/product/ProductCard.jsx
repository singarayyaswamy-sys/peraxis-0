import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  StarIcon
} from '@heroicons/react/24/outline'
import Button from '../ui/Button'
import { useCartStore } from '../../store/cartStore'
import SecurityUtils from '../../utils/security'

const ProductCard = ({ product, index = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { addItem } = useCartStore()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await addItem(product)
    } catch (err) {
      console.error('Failed to add item to cart')
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.1
      }
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8, scale: 1.02 }}
      className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          <div className="aspect-w-1 aspect-h-1 w-full h-64 bg-gray-200">
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={imageLoaded ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              src={product.image || '/api/placeholder/300/300'}
              alt={SecurityUtils.sanitizeInput(product.name)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onLoad={() => setImageLoaded(true)}
            />
          </div>

          {product.discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
              {product.discount}% OFF
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl font-bold text-blue-600">
              ₹{product.price?.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 mb-4">
            <div className="flex text-yellow-400">
              {Array.from({ length: Math.floor(product.rating || 4) }, (_, i) => (
                <StarIcon key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.reviews || 0})</span>
          </div>

          <Button
            onClick={handleAddToCart}
            fullWidth
            leftIcon={<ShoppingCartIcon className="h-4 w-4" />}
          >
            Add to Cart
          </Button>
        </div>
      </Link>
    </motion.div>
  )
}

export default ProductCard