import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Seller Portal</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <BellIcon className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">John Seller</p>
              <p className="text-xs text-gray-500">Seller</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header