import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckIcon, 
  XMarkIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useWebSocket } from '../hooks/useWebSocket'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({ page: 0, size: 20, total: 0, totalPages: 0 })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showProductModal, setShowProductModal] = useState(false)
  
  const { data: wsData } = useWebSocket('ws://localhost:8080/ws/admin')

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [pagination.page, searchTerm, filterStatus, filterCategory])
  
  useEffect(() => {
    if (wsData?.type === 'PRODUCT_STATUS_UPDATED') {
      setProducts(prev => prev.map(product => 
        product._id === wsData.productId 
          ? { ...product, status: wsData.status }
          : product
      ))
    }
  }, [wsData])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterCategory && { category: filterCategory })
      }
      
      const response = await fetch(`http://localhost:8080/api/admin/products?${new URLSearchParams(params)}`)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data)
        setPagination(prev => ({ ...prev, ...data.pagination }))
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/products/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }
  
  const handleStatusUpdate = async (productId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/products/${productId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      if (!data.success) {
        console.error('Failed to update product status:', data.message)
      }
    } catch (error) {
      console.error('Failed to update product status:', error)
    }
  }
  
  const handleFeatureToggle = async (productId, featured) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/products/${productId}/feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured })
      })
      
      const data = await response.json()
      if (data.success) {
        setProducts(prev => prev.map(product => 
          product._id === productId ? { ...product, featured } : product
        ))
      }
    } catch (error) {
      console.error('Failed to toggle product feature:', error)
    }
  }
  
  const viewProductDetails = async (product) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/products/${product._id}`)
      const data = await response.json()
      if (data.success) {
        setSelectedProduct(data.data)
        setShowProductModal(true)
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error)
    }
  }
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...prev, page: 0 }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'DISABLED': return 'bg-gray-100 text-gray-800'
      case 'FEATURED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
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
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <p className="text-gray-600">Manage product listings ({pagination.total} total)</p>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, description, seller..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-96"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="FEATURED">Featured</option>
              <option value="DISABLED">Disabled</option>
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <button 
              onClick={() => setShowProductModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product, index) => (
              <motion.tr
                key={product._id || product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img 
                        className="h-12 w-12 rounded-lg object-cover" 
                        src={product.images?.[0] || product.image || '/placeholder-product.jpg'} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg'
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category}</div>
                      <div className="text-xs text-gray-400">SKU: {product.sku || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.seller?.name || product.seller}</div>
                  <div className="text-xs text-gray-500">{product.seller?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select 
                    value={product.status}
                    onChange={(e) => handleStatusUpdate(product._id, e.target.value)}
                    className={`px-2 py-1 text-xs rounded-full border-0 ${getStatusColor(product.status)}`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleFeatureToggle(product._id, !product.featured)}
                    className={`p-1 rounded ${product.featured ? 'text-yellow-500' : 'text-gray-400'}`}
                    title={product.featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    {product.featured ? (
                      <StarIconSolid className="h-5 w-5" />
                    ) : (
                      <StarIcon className="h-5 w-5" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => viewProductDetails(product)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Product"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    {product.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(product._id, 'APPROVED')}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(product._id, 'REJECTED')}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleStatusUpdate(product._id, 'DISABLED')}
                      className="text-gray-600 hover:text-gray-900"
                      title="Disable Product"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
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

export default Products