import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentArrowDownIcon, 
  EyeIcon, 
  MagnifyingGlassIcon,
  ServerIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import api from '../services/api'

const SuperAdminLogs = () => {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedService, setSelectedService] = useState('')

  useEffect(() => {
    fetchLogs()
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Update stats every 30s
    return () => clearInterval(interval)
  }, [page, selectedService])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/admin/logs/system?page=${page}&size=50`)
      setLogs(response.data.logs || [])
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats/realtime')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const exportData = async () => {
    try {
      const response = await api.get('/admin/logs/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `system-logs-${Date.now()}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const filteredLogs = logs.filter(log => 
    (!searchTerm || log.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     log.userId?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedService || log.service === selectedService)
  )

  const services = ['user-service', 'product-service', 'order-service', 'ai-service', 
                   'websocket-service', 'notification-service', 'location-service']

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Super Admin Logs & Monitoring
        </h1>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          <span>Export All Data</span>
        </button>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Connections</p>
              <p className="text-3xl font-bold text-blue-600">{stats.activeConnections || 0}</p>
            </div>
            <ServerIcon className="h-12 w-12 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.1}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recent Activities</p>
              <p className="text-3xl font-bold text-green-600">{stats.recentActivities || 0}</p>
            </div>
            <ClockIcon className="h-12 w-12 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.2}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Services Up</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.serviceHealth ? Object.values(stats.serviceHealth).filter(s => s === 'UP').length : 0}
              </p>
            </div>
            <ServerIcon className="h-12 w-12 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.3}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Logs</p>
              <p className="text-3xl font-bold text-orange-600">{logs.length}</p>
            </div>
            <EyeIcon className="h-12 w-12 text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
              />
            </div>
          </div>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
          >
            <option value="">All Services</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {log.service}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {log.userId}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 hover:text-blue-800">View Data</summary>
                        <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-600 dark:text-gray-400">Page {page + 1}</span>
        <button
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default SuperAdminLogs