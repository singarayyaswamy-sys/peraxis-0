import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  MapPinIcon, 
  MagnifyingGlassIcon,
  GlobeAltIcon 
} from '@heroicons/react/24/outline'
import { useLocationStore } from '../../store/locationStore'

const LocationModal = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef(null)

  const {
    isLocationModalOpen,
    isLocationLoading,
    closeLocationModal,
    detectCurrentLocation,
    searchLocation,
    geocodeAddress
  } = useLocationStore()

  const handleDetectLocation = async () => {
    const result = await detectCurrentLocation()
    if (!result.success) {
      alert(result.error || 'Unable to detect location')
    }
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.length > 2) {
      setIsSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        const result = await searchLocation(query)
        if (result.success) {
          setSearchResults(result.results || [])
        } else {
          setSearchResults([])
        }
        setIsSearching(false)
      }, 300)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }

  const handleSelectLocation = async (location) => {
    const address = location.description || location.address || searchQuery
    const result = await geocodeAddress(address)
    if (!result.success) {
      alert(result.error || 'Unable to set location')
    }
    setSearchQuery('')
    setSearchResults([])
  }

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <AnimatePresence>
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeLocationModal}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Choose Location
                </h2>
              </div>
              <button
                onClick={closeLocationModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDetectLocation}
                disabled={isLocationLoading}
                className="w-full flex items-center justify-center space-x-3 p-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl transition-colors"
              >
                <GlobeAltIcon className={`h-5 w-5 ${isLocationLoading ? 'animate-spin' : ''}`} />
                <span>
                  {isLocationLoading ? 'Detecting...' : 'Use Current Location'}
                </span>
              </motion.button>

              <div className="flex items-center space-x-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-sm text-gray-500 dark:text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="relative">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search for area, city, pincode..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {((searchResults && searchResults.length > 0) || isSearching) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto z-10">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Searching...
                      </div>
                    ) : (
                      (searchResults || []).map((result, index) => (
                        <button
                          key={result.placeId || index}
                          onClick={() => handleSelectLocation(result)}
                          className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <MapPinIcon className="h-4 w-4 text-primary-500 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {result.structuredFormatting?.mainText || result.description?.split(',')[0] || result.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {result.structuredFormatting?.secondaryText || result.description?.split(',').slice(1).join(',').trim() || 'India'}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {searchQuery && (!searchResults || searchResults.length === 0) && !isSearching && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleSelectLocation({ description: searchQuery })}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Use "{searchQuery}" as location
                  </span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default LocationModal