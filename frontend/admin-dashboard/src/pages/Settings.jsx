import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CogIcon,
  AdjustmentsHorizontalIcon as ToggleIcon,
  ServerIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BellIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { useWebSocket } from '../hooks/useWebSocket'
import SecurityUtils from '../utils/security'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('features')
  const [featureFlags, setFeatureFlags] = useState([])
  const [systemConfig, setSystemConfig] = useState([])
  const [serviceLogs, setServiceLogs] = useState([])
  const [selectedService, setSelectedService] = useState('')
  const [loading, setLoading] = useState(true)
  
  const { data: wsData } = useWebSocket(process.env.NODE_ENV === 'production' ? 'wss://localhost:8085/ws/admin' : 'ws://localhost:8085/ws/admin')

  useEffect(() => {
    fetchFeatureFlags()
    fetchSystemConfig()
    fetchServiceLogs()
  }, [])

  useEffect(() => {
    if (wsData?.type === 'FEATURE_FLAG_UPDATED') {
      setFeatureFlags(prev => prev.map(flag => 
        flag.name === wsData.featureName 
          ? { ...flag, enabled: wsData.enabled }
          : flag
      ))
    }
  }, [wsData])

  const fetchFeatureFlags = async () => {
    try {
      const response = await fetch('http://localhost:8085/api/admin/settings/features')
      const data = await response.json()
      if (data.success) {
        setFeatureFlags(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch feature flags:', error)
    }
  }

  const fetchSystemConfig = async () => {
    try {
      const response = await fetch('http://localhost:8085/api/admin/settings/config')
      const data = await response.json()
      if (data.success) {
        setSystemConfig(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch system config:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchServiceLogs = async () => {
    try {
      const params = selectedService ? `?service=${selectedService}` : ''
      const response = await fetch(`http://localhost:8085/api/admin/logs/services${params}`)
      const data = await response.json()
      if (data.success) {
        setServiceLogs(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch service logs:', error)
    }
  }

  const toggleFeatureFlag = async (flagName, enabled) => {
    try {
      const response = await SecurityUtils.secureFetch(`http://localhost:8085/api/admin/settings/features/${flagName}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled })
      })
      
      const data = await response.json()
      if (!data.success) {
        console.error('Failed to update feature flag:', data.message)
      }
    } catch (error) {
      console.error('Failed to update feature flag:', error)
    }
  }

  const updateSystemConfig = async (configKey, value) => {
    try {
      const response = await fetch(`http://localhost:8085/api/admin/settings/config/${configKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      })
      
      const data = await response.json()
      if (data.success) {
        setSystemConfig(prev => prev.map(config => 
          config.key === configKey ? { ...config, value } : config
        ))
      }
    } catch (error) {
      console.error('Failed to update system config:', error)
    }
  }

  const renderConfigInput = (config) => {
    switch (config.type) {
      case 'boolean':
        return (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.value}
              onChange={(e) => updateSystemConfig(config.key, e.target.checked)}
              className="sr-only"
            />
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.value ? 'bg-indigo-600' : 'bg-gray-200'
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.value ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </label>
        )
      case 'number':
        return (
          <input
            type="number"
            value={config.value}
            onChange={(e) => updateSystemConfig(config.key, parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-24"
          />
        )
      case 'string':
        return (
          <input
            type="text"
            value={config.value}
            onChange={(e) => updateSystemConfig(config.key, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        )
      default:
        return <span className="text-gray-500">Unknown type</span>
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
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Manage platform configuration and features</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'features', name: 'Feature Flags', icon: ToggleIcon },
            { id: 'config', name: 'System Config', icon: CogIcon },
            { id: 'logs', name: 'Service Logs', icon: DocumentTextIcon },
            { id: 'security', name: 'Security', icon: ShieldCheckIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Feature Flags Tab */}
      {activeTab === 'features' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Feature Flags</h3>
            <p className="text-sm text-gray-500">Toggle platform features on/off</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {featureFlags.map((flag, index) => (
              <div key={flag.name} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {flag.name.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-gray-500">{flag.description}</p>
                  </div>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flag.enabled}
                      onChange={(e) => toggleFeatureFlag(flag.name, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      flag.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        flag.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* System Config Tab */}
      {activeTab === 'config' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Configuration</h3>
            <p className="text-sm text-gray-500">Manage system-wide settings</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {systemConfig.map((config, index) => (
              <div key={config.key} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {config.key.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-gray-500">{config.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {renderConfigInput(config)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Service Logs Tab */}
      {activeTab === 'logs' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Service Logs</h3>
                <p className="text-sm text-gray-500">Monitor microservice logs</p>
              </div>
              
              <select
                value={selectedService}
                onChange={(e) => {
                  setSelectedService(e.target.value)
                  fetchServiceLogs()
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Services</option>
                <option value="api-gateway">API Gateway</option>
                <option value="user-service">User Service</option>
                <option value="product-service">Product Service</option>
                <option value="order-service">Order Service</option>
                <option value="admin-service">Admin Service</option>
                <option value="ai-service">AI Service</option>
              </select>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {serviceLogs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No logs available
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {serviceLogs.map((log, index) => (
                  <div key={index} className="px-6 py-3 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <ServerIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {log.service}
                          </span>
                          <span className="text-xs text-gray-500">
                            {log.action}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {log.data?.url || 'System activity'}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.timestamp * 1000).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
            <p className="text-sm text-gray-500">Manage security and access controls</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Authentication</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Multi-Factor Authentication</span>
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Disabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Session Timeout</span>
                    <span className="text-sm text-gray-500">30 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Password Policy</span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Strong
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Access Control</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Admin Access Logs</span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Enabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">API Rate Limiting</span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">IP Whitelisting</span>
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Disabled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Settings