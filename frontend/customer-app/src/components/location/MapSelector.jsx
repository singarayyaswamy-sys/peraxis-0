import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, MapPinIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline'
import secureMapLoader from '../../utils/secureMapLoader'
import api from '../../services/api'
import SecurityUtils from '../../utils/security'

const MapSelector = ({ isOpen, onClose, onLocationSelect, currentLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [addressPreview, setAddressPreview] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const [mapCenter, setMapCenter] = useState({
    lat: currentLocation?.latitude || currentLocation?.coordinates?.lat || 28.6139,
    lng: currentLocation?.longitude || currentLocation?.coordinates?.lng || 77.2090
  })

  const handleMapClick = async (e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    setSelectedLocation({ lat, lng })
    
    // Update marker position
    if (markerRef.current) {
      if (markerRef.current.position !== undefined) {
        markerRef.current.position = { lat, lng }
      } else if (markerRef.current.setPosition) {
        markerRef.current.setPosition({ lat, lng })
      }
    }
    
    // Get address preview
    try {
      const response = await api.post('/location/reverse-geocode', { 
        latitude: lat, 
        longitude: lng 
      })
      setAddressPreview(response.data.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    } catch (error) {
      setAddressPreview(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    }
  }

  const handleConfirmLocation = async () => {
    if (!selectedLocation) return
    
    setIsLoading(true)
    try {
      const response = await api.post('/location/reverse-geocode', {
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      })
      const locationData = response.data
      
      // Confirm and cache the location
      await api.post('/location/confirm', {
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        address: locationData.address || addressPreview
      })
      
      onLocationSelect(locationData)
      onClose()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchLocation = async (query = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }
    
    try {
      const sanitizedQuery = SecurityUtils.sanitizeInput(query)
      const response = await api.get('/location/search-places', {
        params: { query: sanitizedQuery }
      })
      setSearchResults(response.data || [])
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    }
  }
  
  const selectSearchResult = async (result) => {
    try {
      const sanitizedAddress = SecurityUtils.sanitizeInput(result.description)
      const geocodeResponse = await api.post('/location/geocode', { 
        address: sanitizedAddress 
      })
      const locationData = geocodeResponse.data
      
      const newPos = { lat: locationData.latitude, lng: locationData.longitude }
      setSelectedLocation(newPos)
      setAddressPreview(locationData.address)
      
      if (mapRef.current && markerRef.current) {
        mapRef.current.panTo(newPos)
        mapRef.current.setZoom(16)
        
        if (markerRef.current.position !== undefined) {
          markerRef.current.position = newPos
        } else if (markerRef.current.setPosition) {
          markerRef.current.setPosition(newPos)
          if (markerRef.current.setAnimation) {
            markerRef.current.setAnimation(window.google.maps.Animation.BOUNCE)
            setTimeout(() => {
              markerRef.current.setAnimation(null)
            }, 1000)
          }
        }
      }
      setSearchQuery('')
      setShowSearchResults(false)
    } catch (error) {
      console.error('Select search result error:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      initializeMap()
    }
  }, [isOpen, currentLocation])

  const initializeMap = async () => {
    try {
      // Load Google Maps securely
      await secureMapLoader.loadGoogleMaps()
      
      if (!window.google) {
        console.error('Google Maps failed to load')
        return
      }

      // Get secure map configuration
      const mapConfig = await secureMapLoader.getMapConfig()
      
      // Update map center when current location changes
      const newCenter = {
        lat: currentLocation?.latitude || currentLocation?.coordinates?.lat || mapConfig.center.lat,
        lng: currentLocation?.longitude || currentLocation?.coordinates?.lng || mapConfig.center.lng
      }
      setMapCenter(newCenter)
      
      const mapElement = document.getElementById('map-selector')
      if (mapElement) {
        // Clear previous map instance
        mapRef.current = null
        markerRef.current = null
        
        // Create new map with secure configuration
        mapRef.current = new window.google.maps.Map(mapElement, {
          center: newCenter,
          zoom: mapConfig.zoom,
          mapId: mapConfig.mapId,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true
        })

        // Use AdvancedMarkerElement (new recommended approach)
        if (window.google.maps.marker?.AdvancedMarkerElement) {
          markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
            position: newCenter,
            map: mapRef.current,
            title: 'Click to select location'
          })
        } else {
          // Fallback to standard marker
          markerRef.current = new window.google.maps.Marker({
            position: newCenter,
            map: mapRef.current,
            title: 'Click to select location',
            animation: window.google.maps.Animation.DROP,
            draggable: true
          })
          
          markerRef.current.addListener('dragend', (e) => {
            handleMapClick(e)
          })
        }
        
        // Add click listener
        mapRef.current.addListener('click', handleMapClick)
        
        // Set selected location to current location if available
        if (currentLocation?.latitude && currentLocation?.longitude) {
          const currentPos = {
            lat: currentLocation.latitude,
            lng: currentLocation.longitude
          }
          setSelectedLocation(currentPos)
          setAddressPreview(currentLocation.address || currentLocation.city || 'Current location')
        } else {
          setSelectedLocation(newCenter)
          setAddressPreview('Current location')
        }
      }
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
            <div className="flex items-center space-x-4">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center shadow-lg"
              >
                <MapPinIcon className="h-6 w-6 text-primary-600" />
              </motion.div>
              <div>
                <motion.h3 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold text-gray-900 dark:text-white"
                >
                  🎯 Choose Your Location
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  Find your exact delivery address with precision
                </motion.p>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose} 
              className="p-3 hover:bg-white/70 dark:hover:bg-gray-700/70 rounded-full transition-all duration-200 backdrop-blur-sm"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
            </motion.button>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/10 dark:to-secondary-900/10">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value
                    setSearchQuery(value)
                    
                    // Clear previous timeout
                    if (searchTimeoutRef.current) {
                      clearTimeout(searchTimeoutRef.current)
                    }
                    
                    // Auto-search after 300ms delay
                    if (value.trim().length > 2) {
                      searchTimeoutRef.current = setTimeout(() => {
                        searchLocation(value)
                      }, 300)
                    } else {
                      setSearchResults([])
                      setShowSearchResults(false)
                    }
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                  onFocus={() => searchQuery.length > 2 && setShowSearchResults(true)}
                  placeholder="Search for area, city, landmark, or pincode..."
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm focus:shadow-md placeholder-gray-500"
                />
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto z-10">
                    {searchResults.map((result, index) => (
                      <button
                        key={result.place_id || index}
                        onClick={() => selectSearchResult(result)}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <MapPinIcon className="h-4 w-4 text-primary-500 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {result.structured_formatting?.main_text || result.description?.split(',')[0] || result.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {result.structured_formatting?.secondary_text || result.description?.split(',').slice(1).join(',').trim() || 'India'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => searchLocation()}
                disabled={!searchQuery.trim()}
                className={`px-8 py-4 rounded-xl font-semibold transition-all shadow-lg ${
                  searchQuery.trim()
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-primary-500/25'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                🔍 Search
              </motion.button>
            </div>
          </div>

          {/* Content Container */}
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            {/* Left Side - Instructions & Info */}
            <div className="lg:w-1/3 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 lg:border-r border-gray-200 dark:border-gray-700">
              <div className="space-y-6">
                <div className="text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                  >
                    <MapPinIcon className="h-8 w-8 text-primary-600" />
                  </motion.div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select Your Location</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Choose your exact delivery location for accurate service</p>
                </div>
                
                {/* Instructions */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">How to select:</h5>
                  {[
                    { step: '1', text: 'Search for a location using the search bar above', icon: '🔍' },
                    { step: '2', text: 'Or click directly on the map to pin your location', icon: '🗺️' },
                    { step: '3', text: 'Click "Confirm Location" to save your selection', icon: '✅' }
                  ].map((item, index) => (
                    <motion.div 
                      key={item.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm"
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{item.step}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          <span className="mr-2">{item.icon}</span>
                          {item.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                >
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    💡 <strong>Tip:</strong> Zoom in for more precise location selection
                  </p>
                </motion.div>
              </div>
            </div>
            
            {/* Right Side - Map */}
            <div className="lg:w-2/3 relative bg-gray-100 dark:bg-gray-800">
              <div className="relative h-80 lg:h-full min-h-[400px]">
                <div id="map-selector" className="w-full h-full rounded-lg lg:rounded-none lg:rounded-r-2xl overflow-hidden" />
                
                {/* Loading Overlay */}
                {!window.google && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full mb-4"
                    />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Loading secure map...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Initializing location services</p>
                  </div>
                )}
                
                {/* Map Center Overlays */}
                <AnimatePresence>
                  {selectedLocation && addressPreview ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 20 }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm mx-4"
                    >
                      <div className="text-center space-y-3">
                        <div className="flex items-center justify-center space-x-2">
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: "spring" }}
                            className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center"
                          >
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          </motion.div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">📍 Location Selected</p>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{addressPreview}</p>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleConfirmLocation}
                          disabled={isLoading}
                          className="w-full px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          {isLoading ? (
                            <>
                              <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              />
                              <span>Confirming...</span>
                            </>
                          ) : (
                            <>
                              <CheckIcon className="h-4 w-4" />
                              <span>Confirm This Location</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    window.google && (
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm mx-4"
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium">
                          🎯 <strong>Click anywhere on the map</strong> to set your delivery location
                        </p>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-sm">
                <div className={`w-3 h-3 rounded-full ${selectedLocation ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className={`font-medium ${selectedLocation ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {selectedLocation ? '✅ Location selected - Ready to confirm!' : '🗺️ Click anywhere on the map to select'}
                </span>
              </div>
              
              <div className="flex space-x-3 w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 font-medium border border-gray-300 dark:border-gray-600 shadow-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: selectedLocation && !isLoading ? 1.02 : 1 }}
                  whileTap={{ scale: selectedLocation && !isLoading ? 0.98 : 1 }}
                  onClick={handleConfirmLocation}
                  disabled={!selectedLocation || isLoading}
                  className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                    selectedLocation && !isLoading
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-primary-500/25'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      <span>Confirm Location</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
            
            {selectedLocation && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <p className="text-sm text-green-700 dark:text-green-300 text-center">
                  🎆 <strong>Great choice!</strong> Your delivery location is ready to be confirmed.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default MapSelector