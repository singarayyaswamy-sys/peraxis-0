import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  EyeIcon, 
  StarIcon 
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const stats = [
    { name: 'Total Revenue', value: '₹2,45,000', icon: CurrencyDollarIcon, change: '+12%' },
    { name: 'Orders', value: '156', icon: ShoppingBagIcon, change: '+8%' },
    { name: 'Product Views', value: '12,450', icon: EyeIcon, change: '+23%' },
    { name: 'Rating', value: '4.8', icon: StarIcon, change: '+0.2' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((order) => (
              <div key={order} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Order #ORD-{1000 + order}</p>
                  <p className="text-sm text-gray-600">₹{(Math.random() * 10000 + 1000).toFixed(0)}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {['iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Air'].map((product, index) => (
              <div key={product} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{product}</p>
                  <p className="text-sm text-gray-600">{50 - index * 10} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{(Math.random() * 50000 + 10000).toFixed(0)}</p>
                  <p className="text-sm text-gray-600">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard