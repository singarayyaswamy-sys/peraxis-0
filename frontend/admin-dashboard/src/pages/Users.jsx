import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import apiService from '../services/api'
import { useWebSocket } from '../hooks/useWebSocket'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [pagination, setPagination] = useState({ page: 0, size: 20, total: 0, totalPages: 0 })
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  
  const { data: wsData } = useWebSocket('ws://localhost:8080/ws/admin')

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, searchTerm, filterStatus, filterRole])
  
  useEffect(() => {
    if (wsData?.type === 'USER_STATUS_UPDATED') {
      setUsers(prev => prev.map(user => 
        user._id === wsData.userId 
          ? { ...user, status: wsData.status }
          : user
      ))
    }
  }, [wsData])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterRole && { role: filterRole })
      }
      
      const data = await apiService.request(`/users?${new URLSearchParams(params)}`)
      
      if (data.success) {
        setUsers(data.data)
        setPagination(prev => ({ ...prev, ...data.pagination }))
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      const data = await apiService.request(`/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })
      if (!data.success) {
        console.error('Failed to update user status:', data.message)
      }
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }
  
  const handleRoleChange = async (userId, newRole) => {
    try {
      const data = await apiService.request(`/users/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify({ role: newRole })
      })
      if (data.success) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ))
      }
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }
  
  const viewUserDetails = (user) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...prev, page: 0 }))
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800'
      case 'SELLER': return 'bg-blue-100 text-blue-800'
      case 'CUSTOMER': return 'bg-green-100 text-green-800'
      case 'SUPPORT': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'SUSPENDED': return 'bg-red-100 text-red-800'
      case 'PENDING_VERIFICATION': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
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
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage platform users ({pagination.total} total)</p>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-80"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING_VERIFICATION">Pending</option>
            </select>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="SELLER">Seller</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPPORT">Support</option>
            </select>
            
            <button 
              onClick={() => setShowUserModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <motion.tr
                key={user._id || user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {(user.firstName || user.email)?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">{user.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className={`px-2 py-1 text-xs rounded-full border-0 ${getRoleColor(user.role)}`}
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="SELLER">Seller</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPPORT">Support</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select 
                    value={user.status}
                    onChange={(e) => handleStatusUpdate(user._id, e.target.value)}
                    className={`px-2 py-1 text-xs rounded-full border-0 ${getStatusColor(user.status)}`}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="PENDING_VERIFICATION">Pending</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(user.created_at || user.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => viewUserDetails(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {user.role === 'SELLER' && (
                      <button 
                        className="text-green-600 hover:text-green-900"
                        title="Verify Seller"
                      >
                        <ShieldCheckIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleStatusUpdate(user._id, 'SUSPENDED')}
                      className="text-red-600 hover:text-red-900"
                      title="Suspend User"
                    >
                      <ExclamationTriangleIcon className="h-4 w-4" />
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

export default Users