import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  SignalIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import apiService from '../services/api'
import { useWebSocket } from '../hooks/useWebSocket'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    activeConnections: 0,
    recentActivities: 0,
    userGrowth: '0%',
    orderGrowth: '0%',
    revenueGrowth: '0%'
  })
  const [activities, setActivities] = useState([])
  const [systemHealth, setSystemHealth] = useState({})
  const [loading, setLoading] = useState(true)
  
  // WebSocket connection for real-time updates
  const { data: wsData, connectionStatus } = useWebSocket('ws://localhost:8080/ws/admin')

  useEffect(() => {
    fetchInitialData()
    fetchSystemHealth()
    
    // Fetch system health every 30 seconds
    const healthInterval = setInterval(fetchSystemHealth, 30000)
    
    return () => clearInterval(healthInterval)
  }, [])
  
  // Handle WebSocket messages
  useEffect(() => {
    if (wsData) {
      switch (wsData.type) {
        case 'INITIAL_DATA':
          setStats(wsData.stats)
          setActivities(wsData.activities || [])
          setLoading(false)
          break
        case 'STATS_UPDATE':
          setStats(prev => ({ ...prev, ...wsData.data }))
          break
        case 'ACTIVITIES_UPDATE':
          setActivities(wsData.data || [])
          break
        default:
          break
      }
    }
  }, [wsData])

  const fetchInitialData = async () => {
    try {
      const response = await apiService.getDashboardStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/system/health')
      const data = await response.json()
      if (data.success) {
        setSystemHealth(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and key metrics</p>
      </div>

      {/* Connection Status */}
      <div className="mb-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
          connectionStatus === 'Connected' 
            ? 'bg-green-100 text-green-800' 
            : connectionStatus === 'Connecting'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          <SignalIcon className="w-4 h-4 mr-2" />
          Real-time: {connectionStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600">{stats.userGrowth}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingBagIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
              <p className="text-sm text-green-600">{stats.orderGrowth}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{(stats.totalRevenue / 100).toLocaleString()}</p>
              <p className="text-sm text-green-600">{stats.revenueGrowth}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <SignalIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Connections</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeConnections.toLocaleString()}</p>
              <p className="text-sm text-blue-600">Live</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Health Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">System Health</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(systemHealth).map(([service, health], index) => (
                <div key={`${service}-${index}`} className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                    health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <p className="text-sm font-medium capitalize">{service}</p>
                  <p className="text-xs text-gray-500">
                    {health?.responseTime || health?.status || 'Unknown'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {stats.recentActivities}
          </div>
          <p className="text-sm text-gray-600">Last hour</p>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Live Activity Feed</h3>
          <div className="flex items-center text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live
          </div>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.length > 0 ? activities.slice(0, 10).map((activity, index) => (
            <motion.div 
              key={activity._id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
            >
              <div>
                <p className="font-medium">{activity.userId || 'System'}</p>
                <p className="text-sm text-gray-600">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.service}</p>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </span>
            </motion.div>
          )) : (
            <div className="text-center py-8 text-gray-500">
              <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2" />
              <p>No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard