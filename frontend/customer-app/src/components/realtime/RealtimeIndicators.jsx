import { motion, AnimatePresence } from 'framer-motion'
import { 
  WifiIcon, 
  ExclamationTriangleIcon,
  UserGroupIcon,
  EyeIcon,
  ShoppingCartIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { useWebSocket } from '../../hooks/useWebSocket'

const RealtimeIndicators = () => {
  const { 
    isConnected, 
    connectionStatus, 
    onlineUsers, 
    realtimeData,
    notifications 
  } = useWebSocket()

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500'
      case 'connecting': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <WifiIcon className="h-4 w-4" />
      case 'connecting': return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><WifiIcon className="h-4 w-4" /></motion.div>
      case 'error': return <ExclamationTriangleIcon className="h-4 w-4" />
      default: return <WifiIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span className="text-xs font-medium capitalize">{connectionStatus}</span>
      </motion.div>

      <AnimatePresence>
        {isConnected && onlineUsers.size > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border"
          >
            <UserGroupIcon className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium">{onlineUsers.size} online</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="relative"
          >
            <BellIcon className="h-6 w-6 text-orange-500" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RealtimeIndicators