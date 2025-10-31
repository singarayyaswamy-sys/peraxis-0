import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import { useCartStore } from '../store/cartStore'
import { useWebSocket } from '../hooks/useWebSocket'

const CartPage = () => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore()
  const { trackActivity } = useWebSocket()

  const handleQuantityChange = async (productId, newQuantity) => {
    await updateQuantity(productId, newQuantity)
    trackActivity({ type: 'cart_update', productId, quantity: newQuantity })
  }

  const handleRemoveItem = async (productId) => {
    await removeItem(productId)
    trackActivity({ type: 'cart_remove', productId })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Add some products to get started
          </p>
          <Link to="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              Continue Shopping
            </motion.button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text">Shopping Cart</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {items.length} item{items.length !== 1 ? 's' : ''} in your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 flex items-center space-x-4"
              >
                <img
                  src={item.product?.image || '/api/placeholder/150/150'}
                  alt={item.product?.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.product?.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {item.product?.brand}
                  </p>
                  <p className="text-primary-600 font-bold mt-1">
                    ₹{item.price?.toLocaleString()}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </motion.button>
                  
                  <span className="text-lg font-semibold w-8 text-center">
                    {item.quantity}
                  </span>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Remove Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveItem(item.productId)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-5 w-5" />
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 h-fit sticky top-24"
          >
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{Math.round(total * 0.18).toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{Math.round(total * 1.18).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Link to="/checkout">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary mb-4"
              >
                Proceed to Checkout
              </motion.button>
            </Link>

            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-secondary"
              >
                Continue Shopping
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CartPage