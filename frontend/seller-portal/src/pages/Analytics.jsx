import { motion } from 'framer-motion'

const Analytics = () => {
  const metrics = [
    { label: 'Revenue This Month', value: '₹1,25,000', change: '+15%' },
    { label: 'Orders This Month', value: '89', change: '+8%' },
    { label: 'Conversion Rate', value: '3.2%', change: '+0.5%' },
    { label: 'Avg Order Value', value: '₹1,404', change: '+12%' }
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your store performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-sm font-medium text-gray-500">{metric.label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
            <p className="text-sm text-green-600 mt-1">{metric.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart placeholder - Integrate with charting library</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-4">
            {['Electronics', 'Fashion', 'Home & Garden'].map((category, index) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-gray-700">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${80 - index * 20}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{80 - index * 20}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics