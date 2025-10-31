import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TruckIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useLocationStore } from '../../store/locationStore'

const DeliveryEstimate = ({ productId, className = '' }) => {
  const [estimate, setEstimate] = useState(null)
  const [loading, setLoading] = useState(false)
  const { currentLocation, getDeliveryEstimate } = useLocationStore()

  useEffect(() => {
    if (productId && currentLocation?.pincode) {
      setLoading(true)
      getDeliveryEstimate(productId).then(result => {
        setEstimate(result)
        setLoading(false)
      })
    }
  }, [productId, currentLocation?.pincode, getDeliveryEstimate])

  if (!currentLocation) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <TruckIcon className="h-4 w-4" />
        <span className="text-sm">Select location for delivery info</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <ClockIcon className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking delivery...</span>
      </div>
    )
  }

  if (!estimate || !estimate.serviceable) {
    return (
      <div className={`flex items-center space-x-2 text-red-500 ${className}`}>
        <TruckIcon className="h-4 w-4" />
        <span className="text-sm">Not deliverable to {currentLocation.pincode}</span>
      </div>
    )
  }

  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + estimate.deliveryDays)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center space-x-2 text-green-600 ${className}`}
    >
      <TruckIcon className="h-4 w-4" />
      <span className="text-sm font-medium">
        Delivery by {deliveryDate.toLocaleDateString('en-IN', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })}
      </span>
      {estimate.freeDelivery && (
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
          FREE
        </span>
      )}
    </motion.div>
  )
}

export default DeliveryEstimate