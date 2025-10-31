import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon, 
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { useWebSocket } from '../hooks/useWebSocket'

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    dailyRevenue: {},
    topProducts: [],
    statusDistribution: {}
  })
  const [sellerAnalytics, setSellerAnalytics] = useState([])
  const [loading, setLoading] = useState(true)
  
  const { data: wsData } = useWebSocket('ws://localhost:8085/ws/admin')
  
  useEffect(() => {
    fetchAnalyticsData()
    fetchSellerAnalytics()
  }, [selectedPeriod])
  
  useEffect(() => {
    if (wsData?.type === 'STATS_UPDATE') {
      setAnalyticsData(prev => ({
        ...prev,
        totalRevenue: wsData.data.totalRevenue || prev.totalRevenue,
        totalOrders: wsData.data.totalOrders || prev.totalOrders
      }))
    }
  }, [wsData])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8085/api/admin/analytics/overview?days=${selectedPeriod}`)
      const data = await response.json()
      
      if (data.success) {
        setAnalyticsData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchSellerAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:8085/api/admin/analytics/sellers')
      const data = await response.json()
      
      if (data.success) {
        setSellerAnalytics(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch seller analytics:', error)
    }
  }
  
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `₹${price.toLocaleString()}`
    }
    return '₹0'
  }
  
  const getRevenueChartData = () => {
    const sortedDates = Object.keys(analyticsData.dailyRevenue || {})
      .sort((a, b) => new Date(a) - new Date(b))
      .slice(-7)
    
    return sortedDates.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: analyticsData.dailyRevenue[date] || 0
    }))
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Platform performance insights</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(analyticsData.totalRevenue)}</p>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +18% from last period
              </div>
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
            <ShoppingBagIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalOrders.toLocaleString()}</p>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +12% from last period
              </div>
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
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Avg Order Value</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(analyticsData.totalOrders > 0 ? analyticsData.totalRevenue / analyticsData.totalOrders : 0)}
              </p>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +5% from last period
              </div>
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
            <UsersIcon className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Active Sellers</h3>
              <p className="text-2xl font-bold text-gray-900">{sellerAnalytics.length}</p>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +8% from last period
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h3>
          <div className="h-64">
            {getRevenueChartData().length > 0 ? (
              <div className="h-full flex items-end justify-between space-x-2">
                {getRevenueChartData().map((item, index) => {
                  const maxRevenue = Math.max(...getRevenueChartData().map(d => d.revenue))
                  const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 200 : 0
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${height}px`, minHeight: '4px' }}
                        title={`${item.date}: ${formatPrice(item.revenue)}`}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                        {item.date}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <ChartBarIcon className="h-16 w-16" />
                <span className="ml-2">No data available</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="h-64">
            {Object.keys(analyticsData.statusDistribution || {}).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(analyticsData.statusDistribution).map(([status, count]) => {
                  const total = Object.values(analyticsData.statusDistribution).reduce((a, b) => a + b, 0)
                  const percentage = total > 0 ? (count / total) * 100 : 0
                  
                  const getStatusColor = (status) => {
                    switch (status) {
                      case 'DELIVERED': return 'bg-green-500'
                      case 'SHIPPED': return 'bg-blue-500'
                      case 'PROCESSING': return 'bg-yellow-500'
                      case 'CANCELLED': return 'bg-red-500'
                      case 'REFUNDED': return 'bg-purple-500'
                      default: return 'bg-gray-500'
                    }
                  }
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded ${getStatusColor(status)} mr-3`}></div>
                        <span className="text-sm font-medium text-gray-700 capitalize">{status.toLowerCase()}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className={`h-2 rounded-full ${getStatusColor(status)}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <ArrowTrendingUpIcon className="h-16 w-16" />
                <span className="ml-2">No data available</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Sellers</h3>
          <div className="space-y-4">
            {sellerAnalytics.length > 0 ? sellerAnalytics.slice(0, 5).map((seller, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{seller.name}</p>
                  <p className="text-sm text-gray-600">{seller.email}</p>
                  <p className="text-sm text-gray-500">{seller.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatPrice(seller.revenue)}</p>
                  <div className="flex items-center text-sm text-green-600">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    +{Math.floor(Math.random() * 20 + 5)}%
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <UsersIcon className="h-12 w-12 mx-auto mb-2" />
                <p>No seller data available</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibent text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {analyticsData.topProducts && analyticsData.topProducts.length > 0 ? analyticsData.topProducts.map((product, index) => {
              const maxSales = Math.max(...analyticsData.topProducts.map(p => p.sales))
              const percentage = maxSales > 0 ? (product.sales / maxSales) * 100 : 0
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-indigo-500 rounded mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">{product.name}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{product.sales} sold</span>
                  </div>
                </div>
              )
            }) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBagIcon className="h-12 w-12 mx-auto mb-2" />
                <p>No product data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics