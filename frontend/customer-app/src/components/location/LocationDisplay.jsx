import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPinIcon, ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useLocationStore } from '../../store/locationStore'
import { useAuthStore } from '../../store/authStore'
import { useLocation } from '../../hooks/useLocation'
import SaveAddressButton from './SaveAddressButton'
import MapSelector from './MapSelector'

const LocationDisplay = ({ className = '' }) => {
  const [showHoverCard, setShowHoverCard] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  

  const navigate = useNavigate()
  const { currentLocation, savedAddresses, recentSearches, selectSavedAddress, selectRecentSearch, saveCurrentAddress } = useLocationStore()
  const { isAuthenticated } = useAuthStore()
  const { getCurrentLocation, searchPlaces, selectPlace, isLoading } = useLocation()
  
  const isLoggedIn = isAuthenticated

  const displayText = currentLocation 
    ? currentLocation.city || currentLocation.address?.split(',')[0] || 'Unknown'
    : 'Select Location'

  const pincode = currentLocation?.pincode

  const handleCurrentLocation = async () => {
    await getCurrentLocation()
    setShowHoverCard(false)
  }

  const handleSearchChange = async (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length > 2) {
      setIsSearching(true)
      const results = await searchPlaces(query)
      setSearchResults(results || [])
      setIsSearching(false)
    } else {
      setSearchResults([])
    }
  }

  const handleSelectPlace = async (place) => {
    await selectPlace(place)
    setSearchQuery('')
    setSearchResults([])
    setShowHoverCard(false)
  }

  const handleSelectSavedAddress = (savedAddress) => {
    selectSavedAddress(savedAddress)
    setShowHoverCard(false)
  }

  const handleSelectRecentSearch = (recentSearch) => {
    selectRecentSearch(recentSearch)
    setShowHoverCard(false)
  }

  const handleLoginClick = () => {
    setShowHoverCard(false)
    navigate('/login')
  }

  const handleMapLocationSelect = (locationData) => {
    if (locationData) {
      const { setLocation } = useLocationStore.getState()
      setLocation({
        address: locationData.address,
        city: locationData.city,
        state: locationData.state,
        pincode: locationData.pincode,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      })
    }
    setShowMapModal(false)
  }

  return (
    <div className="relative" data-location-version="v2.0">
      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowHoverCard(!showHoverCard)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-primary-50 hover:to-secondary-50 dark:hover:from-primary-900/20 dark:hover:to-secondary-900/20 border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 shadow-sm hover:shadow-md ${className}`}
      >
        <div className="relative">
          <motion.div
            animate={currentLocation ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MapPinIcon className={`h-5 w-5 ${currentLocation ? 'text-primary-600' : 'text-gray-400'}`} />
          </motion.div>
          {currentLocation && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
            />
          )}
        </div>
        <div className="text-left flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Deliver to</p>
          <div className="flex items-center space-x-2 mt-0.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {displayText}
            </p>
            {pincode && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full font-medium"
              >
                {pincode}
              </motion.span>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: showHoverCard ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showHoverCard && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowHoverCard(false)}
            />
            <motion.div
              key="location-hover-card-v2"
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute top-full left-0 mt-3 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden backdrop-blur-sm"
              data-hover-card="new"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.95) 100%)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
                <div className="flex items-center space-x-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center"
                  >
                    <MapPinIcon className="h-5 w-5 text-primary-600" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Location</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Choose your delivery location</p>
                  </div>
                  {isLoggedIn && <SaveAddressButton />}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowHoverCard(false)}
                  className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-500" />
                </motion.button>
              </div>

              {/* Search Input */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search a new address"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCurrentLocation}
                  disabled={isLoading}
                  className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  <motion.div 
                    animate={isLoading ? { rotate: 360 } : { scale: [1, 1.1, 1] }}
                    transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 2, repeat: Infinity }}
                    className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </motion.div>
                  <span className="text-sm font-semibold">
                    {isLoading ? 'Detecting Location...' : 'Use My Current Location'}
                  </span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowHoverCard(false)
                    setShowMapModal(true)
                  }}
                  className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-secondary-50 hover:to-secondary-100 dark:hover:from-secondary-900/20 dark:hover:to-secondary-800/20 rounded-xl transition-all duration-300 border border-gray-200 dark:border-gray-600 hover:border-secondary-300 dark:hover:border-secondary-600 shadow-sm hover:shadow-md"
                >
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    className="w-6 h-6 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center"
                  >
                    <MapPinIcon className="w-4 h-4 text-secondary-600" />
                  </motion.div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Select on Map
                  </span>
                </motion.button>
              </div>

              {/* Saved Addresses or Recent Searches */}
              {isLoggedIn ? (
                // Logged in users see saved addresses
                savedAddresses.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <div className="p-4 pb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Saved Addresses</h4>
                      <div className="space-y-2">
                        {savedAddresses.slice(0, 3).map((address) => (
                          <motion.button
                            key={address.id}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => handleSelectSavedAddress(address)}
                            className="w-full flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                          >
                            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center mt-0.5">
                              <MapPinIcon className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {address.label}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {address.address}
                              </p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                // Non-logged users see recent searches or login prompt
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <div className="p-4 pb-2">
                    {recentSearches && recentSearches.length > 0 ? (
                      <>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent Searches</h4>
                        <div className="space-y-2">
                          {recentSearches.slice(0, 3).map((search) => (
                            <motion.button
                              key={search.id}
                              whileHover={{ scale: 1.01 }}
                              onClick={() => handleSelectRecentSearch(search)}
                              className="w-full flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                            >
                              <div className="w-5 h-5 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center mt-0.5">
                                <MagnifyingGlassIcon className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {search.city || search.address?.split(',')[0]}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {search.address}
                                </p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                          Login to save addresses
                        </p>
                        <button 
                          onClick={handleLoginClick}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Sign In
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {(searchResults.length > 0 || isSearching) && (
                <div className="border-t border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Searching...
                    </div>
                  ) : (
                    searchResults.map((result, index) => {
                      const mainText = result.structuredFormatting?.mainText || result.description?.split(',')[0] || result.description
                      const secondaryText = result.structuredFormatting?.secondaryText || result.description?.split(',').slice(1).join(',').trim() || 'India'
                      const isPincode = mainText.includes('Pincode') || /\d{6}/.test(secondaryText)
                      
                      return (
                        <button
                          key={result.placeId || index}
                          onClick={() => handleSelectPlace(result)}
                          className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <MapPinIcon className={`h-4 w-4 mt-1 flex-shrink-0 ${isPincode ? 'text-green-500' : 'text-primary-500'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {mainText}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {secondaryText}
                                {isPincode && <span className="ml-1 text-green-600 font-medium">✓ Pincode</span>}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              )}

              {/* Location Permission Image */}
              {!searchQuery && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <MapPinIcon className="h-16 w-16 text-gray-400" />
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Map Selector */}
      <MapSelector
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onLocationSelect={handleMapLocationSelect}
        currentLocation={currentLocation}
      />
    </div>
  )
}

export default LocationDisplay