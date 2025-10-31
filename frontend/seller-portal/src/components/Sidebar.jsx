import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  CubeIcon, 
  ShoppingBagIcon, 
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline'

const Sidebar = () => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Products', href: '/products', icon: CubeIcon },
    { name: 'Orders', href: '/orders', icon: ShoppingBagIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ]

  return (
    <div className="bg-white w-64 min-h-screen shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Peraxis Seller</span>
        </div>
      </div>

      <nav className="mt-8">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar