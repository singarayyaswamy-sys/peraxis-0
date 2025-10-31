import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  LightBulbIcon, 
  ExclamationTriangleIcon,
  TrendingUpIcon,
  CpuChipIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import SecurityUtils from '../../utils/security'

const AIInsights = () => {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAIInsights()
    const interval = setInterval(fetchAIInsights, 300000)
    return () => clearInterval(interval)
  }, [])

  const fetchAIInsights = async () => {
    try {
      setLoading(true)
      const response = await SecurityUtils.secureFetch('http://localhost:8084/api/ai/analytics/predictive')
      const data = await response.json()
      
      if (data.success) {
        setInsights(data.data)
        setError(null)
      } else {
        setError('Failed to fetch AI insights')
      }
    } catch (err) {
      setError('Error connecting to AI service')
      console.error('AI insights error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">AI is analyzing your data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
          <p>{error}</p>
          <button 
            onClick={fetchAIInsights}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center">
          <CpuChipIcon className="h-8 w-8 mr-3" />
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
            <p className="text-purple-100">Advanced analytics and predictions for your business</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm opacity-75">Confidence Score</div>
            <div className="text-2xl font-bold">{Math.round((insights?.confidence || 0) * 100)}%</div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <div className="flex items-center mb-4">
          <TrendingUpIcon className="h-6 w-6 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold">Revenue Prediction</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Next Month Prediction</div>
            <div className="text-2xl font-bold text-green-700">
              ${insights?.predictedRevenue?.toLocaleString() || '0'}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Growth Trend</div>
            <div className="text-2xl font-bold text-blue-700">
              {insights?.predictedRevenue > 0 ? '+' : ''}
              {((insights?.predictedRevenue || 0) / 10000 * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Active Users</div>
            <div className="text-2xl font-bold text-purple-700">
              {insights?.userBehavior?.activeUsers?.toLocaleString() || '0'}
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
        <div className="flex items-center mb-4">
          <SparklesIcon className="h-6 w-6 text-yellow-600 mr-2" />
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
        
        <div className="space-y-3">
          {insights?.recommendations?.slice(0, 5).map((rec, index) => (
            <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <LightBulbIcon className="h-5 w-5 text-yellow-600 mr-3" />
              <div className="flex-1">
                <div className="font-medium">Product ID: {rec.productId}</div>
                <div className="text-sm text-gray-600">{rec.reason}</div>
              </div>
              <div className="text-sm font-medium text-yellow-700">
                Score: {rec.score?.toFixed(1)}
              </div>
            </div>
          )) || (
            <div className="text-gray-500 text-center py-4">
              No recommendations available yet
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <div className="flex items-center mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold">Anomaly Detection</h3>
        </div>
        
        {insights?.anomalies?.length > 0 ? (
          <div className="space-y-3">
            {insights.anomalies.map((anomaly, index) => (
              <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3" />
                <div className="flex-1">
                  <div className="font-medium capitalize">{anomaly.type?.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-600">
                    Order: {anomaly.orderId} - Value: ${anomaly.value}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  anomaly.severity === 'high' ? 'bg-red-100 text-red-800' :
                  anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {anomaly.severity}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No anomalies detected - your system is running smoothly!</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default AIInsights