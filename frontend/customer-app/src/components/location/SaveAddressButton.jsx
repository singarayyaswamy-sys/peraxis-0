import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { useLocationStore } from '../../store/locationStore'
import toast from 'react-hot-toast'

const SaveAddressButton = ({ className = '' }) => {
  const [label, setLabel] = useState('Home')
  const [showInput, setShowInput] = useState(false)
  const { currentLocation, saveCurrentAddress } = useLocationStore()

  const handleSave = async () => {
    if (currentLocation && label.trim()) {
      const result = await saveCurrentAddress(label.trim())
      if (result.success) {
        setShowInput(false)
        setLabel('Home')
      } else {
        toast.error(result.error || 'Failed to save address')
      }
    }
  }

  if (!currentLocation) return null

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showInput ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Address label"
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <button
            onClick={handleSave}
            className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Save
          </button>
          <button
            onClick={() => setShowInput(false)}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowInput(true)}
          className="flex items-center space-x-1 px-2 py-1 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
        >
          <BookmarkIcon className="h-3 w-3" />
          <span>Save</span>
        </motion.button>
      )}
    </div>
  )
}

export default SaveAddressButton