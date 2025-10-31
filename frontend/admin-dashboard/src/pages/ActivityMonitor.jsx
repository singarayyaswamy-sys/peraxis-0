import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  EyeIcon, 
  UserIcon, 
  MagnifyingGlassIcon, 
  ShoppingCartIcon,
  FunnelIcon,
  CalendarIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useWebSocket } from '../hooks/useWebSocket'

const ActivityMonitor = () => {
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterUserId, setFilterUserId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pagination, setPagination] = useState({ page: 0, size: 50, total: 0, totalPages: 0 })
  
  const { data: wsData } = useWebSocket('ws://localhost:8085/ws/admin')

  useEffect(() => {
    fetchActivities()
    fetchStats()
  }, [pagination.page, filterService, filterAction, filterUserId, dateFrom, dateTo])
  
  useEffect(() => {
    if (wsData?.type === 'ACTIVITIES_UPDATE') {
      setActivities(prev => {
        const newActivities = wsData.data || []
        // Merge new activities with existing ones, avoiding duplicates
        const merged = [...newActivities, ...prev]
        const unique = merged.filter((activity, index, self) => 
          index === self.findIndex(a => a._id === activity._id)
        )
        return unique.slice(0, 100) // Keep only latest 100
      })
    }
    
    if (wsData?.type === 'STATS_UPDATE') {
      fetchStats() // Refresh stats when new data comes in
    }
  }, [wsData])
  
  useEffect(() => {
    // Real-time updates every 10 seconds
    const interval = setInterval(() => {
      fetchStats()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...(filterService && { service: filterService }),
        ...(filterAction && { action: filterAction }),
        ...(filterUserId && { userId: filterUserId }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      }
      
      const response = await fetch(`http://localhost:8085/api/admin/activity/logs?${new URLSearchParams(params)}`)
      const data = await response.json()
      
      if (data.success) {
        setActivities(data.data)
        setPagination(prev => ({ ...prev, ...data.pagination }))
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8085/api/admin/activity/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'USER_LOGIN':
      case 'USER_REGISTER': return <UserIcon className="h-4 w-4" />
      case 'PRODUCT_SEARCH':
      case 'AI_SEARCH': return <MagnifyingGlassIcon className="h-4 w-4" />
      case 'ADD_TO_CART':
      case 'ORDER_PLACED': return <ShoppingCartIcon className="h-4 w-4" />
      case 'WEBSOCKET_CONNECTED': return <GlobeAltIcon className="h-4 w-4" />
      default: return <EyeIcon className="h-4 w-4" />
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'USER_LOGIN':
      case 'USER_REGISTER': return 'text-green-600 bg-green-100'
      case 'PRODUCT_SEARCH':
      case 'AI_SEARCH': return 'text-blue-600 bg-blue-100'
      case 'ADD_TO_CART':
      case 'ORDER_PLACED': return 'text-purple-600 bg-purple-100'
      case 'WEBSOCKET_CONNECTED': return 'text-indigo-600 bg-indigo-100'
      case 'ERROR': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }
  
  const getServiceIcon = (service) => {
    switch (service) {
      case 'customer-app': return <DevicePhoneMobileIcon className="h-4 w-4" />
      case 'admin-dashboard': return <ComputerDesktopIcon className="h-4 w-4" />
      default: return <GlobeAltIcon className="h-4 w-4" />
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Activity Monitor</h1>
        <p className="text-gray-600">Real-time user activity tracking</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { name: 'Total Activities', value: stats.totalActivities || 0, color: 'bg-blue-500', icon: ChartBarIcon },
          { name: 'Active Users', value: stats.activeUsers || 0, color: 'bg-green-500', icon: UserIcon },
          { name: 'Service Requests', value: stats.serviceStats?.length || 0, color: 'bg-purple-500', icon: ComputerDesktopIcon },
          { name: 'Top Actions', value: stats.topActions?.length || 0, color: 'bg-indigo-500', icon: EyeIcon }
        ].map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Last 24 hours</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Services</option>
            <option value="customer-app">Customer App</option>
            <option value="admin-service">Admin Service</option>
            <option value="user-service">User Service</option>
            <option value="product-service">Product Service</option>
            <option value="order-service">Order Service</option>
          </select>
          
          <input
            type="text"
            placeholder="Filter by action..."
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          
          <input
            type="text"
            placeholder="Filter by user ID..."
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          
          <button 
            onClick={() => {
              setFilterService('')
              setFilterAction('')
              setFilterUserId('')
              setDateFrom('')
              setDateTo('')
              setPagination(prev => ({ ...prev, page: 0 }))
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
      </div>



      {/* Activity Feed */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
          <p className="text-sm text-gray-500">Updates every 5 seconds</p>
        </div>
        
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {loading ? 'Loading activities...' : 'No activities found'}
            </div>
          ) : (
            activities.map((activity, index) => (
              <motion.div
                key={activity._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="p-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${getActionColor(activity.action)}`}>
                    {getActionIcon(activity.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.userId || 'Anonymous'}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(activity.action)}`}>
                        {activity.action}
                      </span>
                      <div className="flex items-center space-x-1">
                        {getServiceIcon(activity.service)}
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {activity.service}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-1">
                      {activity.data && (
                        <p className="text-sm text-gray-600">
                          {activity.data.url && (
                            <span className="text-blue-600">{activity.data.url}</span>
                          )}
                          {activity.data.userAgent && (
                            <span className="ml-2 text-xs text-gray-500">
                              {activity.data.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
                            </span>
                          )}
                        </p>
                      )}
                      
                      {activity.sessionId && (
                        <p className="text-xs text-gray-400 mt-1">
                          Session: {activity.sessionId.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp * 1000).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
              disabled={pagination.page === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages - 1, prev.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{pagination.page * pagination.size + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min((pagination.page + 1) * pagination.size, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                  disabled={pagination.page === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages - 1, prev.page + 1) }))}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityMonitor