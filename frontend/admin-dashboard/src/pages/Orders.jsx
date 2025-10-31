import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  EyeIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useWebSocket } from '../hooks/useWebSocket'
import apiService from '../services/api'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pagination, setPagination] = useState({ page: 0, size: 20, total: 0, totalPages: 0 })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  
  const { data: wsData } = useWebSocket('ws://localhost:8085/ws/admin')

  useEffect(() => {
    fetchOrders()
  }, [pagination.page, searchTerm, filterStatus, dateFrom, dateTo])
  
  useEffect(() => {
    if (wsData?.type === 'ORDER_STATUS_UPDATED') {
      setOrders(prev => prev.map(order => 
        order._id === wsData.orderId 
          ? { ...order, status: wsData.status }
          : order
      ))
    }
  }, [wsData])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      }
      
      const response = await fetch(`http://localhost:8085/api/admin/orders?${new URLSearchParams(params)}`)
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data)
        setPagination(prev => ({ ...prev, ...data.pagination }))
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleStatusUpdate = async (orderId, newStatus, trackingNumber = '') => {
    try {
      const response = await fetch(`http://localhost:8085/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, trackingNumber })
      })
      
      const data = await response.json()
      if (!data.success) {
        console.error('Failed to update order status:', data.message)
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }
  
  const handleRefund = async (orderId, amount, reason) => {
    try {
      const response = await fetch(`http://localhost:8085/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason })
      })
      
      const data = await response.json()
      if (data.success) {
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, status: 'REFUNDED' } : order
        ))
        setShowRefundModal(false)
      }
    } catch (error) {
      console.error('Failed to process refund:', error)
    }
  }
  
  const viewOrderDetails = async (order) => {
    try {
      const response = await fetch(`http://localhost:8085/api/admin/orders/${order._id}`)
      const data = await response.json()
      if (data.success) {
        setSelectedOrder(data.data)
        setShowOrderModal(true)
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error)
    }
  }
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...prev, page: 0 }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'SHIPPED': return 'bg-blue-100 text-blue-800'
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'REFUNDED': return 'bg-purple-100 text-purple-800'
      case 'PENDING': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircleIcon className="h-4 w-4" />
      case 'SHIPPED': return <TruckIcon className="h-4 w-4" />
      case 'PROCESSING': return <ClockIcon className="h-4 w-4" />
      case 'CANCELLED': return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'REFUNDED': return <CurrencyDollarIcon className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }
  
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `₹${price.toLocaleString()}`
    }
    return '₹0'
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
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600">Monitor all platform orders ({pagination.total} total)</p>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="From Date"
          />
          
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="To Date"
          />
          
          <button 
            onClick={() => {
              setSearchTerm('')
              setFilterStatus('')
              setDateFrom('')
              setDateTo('')
              setPagination(prev => ({ ...prev, page: 0 }))
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order, index) => (
              <motion.tr
                key={order._id || order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {order.orderId || order.id || order._id}
                  </div>
                  {order.trackingNumber && (
                    <div className="text-xs text-gray-500">Track: {order.trackingNumber}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {order.customer?.name || order.customer}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.customer?.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {Array.isArray(order.items) ? order.items.length : 1} items
                  </div>
                  {Array.isArray(order.items) && order.items[0] && (
                    <div className="text-xs text-gray-500">
                      {order.items[0].name}...
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(order.total)}
                  </div>
                  {order.refund && (
                    <div className="text-xs text-red-500">
                      Refunded: {formatPrice(order.refund.amount)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className={`px-2 py-1 text-xs rounded-full border-0 ${getStatusColor(order.status)} mr-2`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    {getStatusIcon(order.status)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(order.created_at || order.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => viewOrderDetails(order)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {order.status !== 'REFUNDED' && order.status !== 'CANCELLED' && (
                      <button 
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowRefundModal(true)
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Process Refund"
                      >
                        <CurrencyDollarIcon className="h-4 w-4" />
                      </button>
                    )}
                    {order.status === 'PROCESSING' && (
                      <button 
                        onClick={() => {
                          const trackingNumber = prompt('Enter tracking number:');
                          if (trackingNumber) {
                            handleStatusUpdate(order._id, 'SHIPPED', trackingNumber);
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Mark as Shipped"
                      >
                        <TruckIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        
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

export default Orders