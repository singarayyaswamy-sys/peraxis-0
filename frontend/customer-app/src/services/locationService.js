import api from './api'

export const locationService = {
  // Geocode address to coordinates
  geocode: async (address) => {
    try {
      const response = await api.post('/location/geocode', { address })
      return response.data
    } catch (error) {
      console.error('Geocode error:', error)
      return null
    }
  },

  // Reverse geocode coordinates to address
  reverseGeocode: async (latitude, longitude) => {
    try {
      const response = await api.post('/location/reverse-geocode', { latitude, longitude })
      return response.data
    } catch (error) {
      console.error('Reverse geocode error:', error)
      return null
    }
  },

  // Search places with autocomplete (using backend proxy)
  searchPlaces: async (query) => {
    try {
      const response = await api.get(`/location/search-places?query=${encodeURIComponent(query)}`)
      return response.data || []
    } catch (error) {
      console.error('Search places error:', error)
      return []
    }
  },

  // Get place details
  getPlaceDetails: async (placeId) => {
    try {
      const response = await api.get(`/location/place-details?placeId=${placeId}`)
      return response.data
    } catch (error) {
      console.error('Place details error:', error)
      return { data: null }
    }
  },

  // Check if pincode is serviceable
  checkServiceability: async (pincode) => {
    return api.get(`/location/serviceability?pincode=${pincode}`)
  },

  // Get delivery estimate for product and location
  getDeliveryEstimate: async (productId, pincode) => {
    return api.get(`/location/delivery-estimate?productId=${productId}&pincode=${pincode}`)
  },

  // Get nearby warehouses
  getNearbyWarehouses: async (latitude, longitude, radius = 50) => {
    return api.get(`/location/warehouses?lat=${latitude}&lng=${longitude}&radius=${radius}`)
  },

  // Get saved addresses
  getSavedAddresses: async () => {
    try {
      const response = await api.get('/location/saved-addresses')
      return response.data
    } catch (error) {
      console.error('Get saved addresses error:', error)
      return []
    }
  },

  // Save address
  saveAddress: async (addressData) => {
    try {
      const response = await api.post('/location/saved-addresses', addressData)
      return response.data
    } catch (error) {
      console.error('Save address error:', error)
      throw error
    }
  },

  // Delete saved address
  deleteSavedAddress: async (addressId) => {
    try {
      await api.delete(`/location/saved-addresses/${addressId}`)
      return true
    } catch (error) {
      console.error('Delete saved address error:', error)
      return false
    }
  },

  // Confirm and save current location
  confirmLocation: async (locationData) => {
    try {
      // Save to backend
      const response = await api.post('/location/confirm', locationData)
      
      // Cache in localStorage
      localStorage.setItem('confirmedLocation', JSON.stringify({
        ...locationData,
        timestamp: Date.now()
      }))
      
      return response.data
    } catch (error) {
      console.error('Confirm location error:', error)
      throw error
    }
  },

  // Get confirmed location from cache
  getConfirmedLocation: () => {
    try {
      const cached = localStorage.getItem('confirmedLocation')
      if (cached) {
        const location = JSON.parse(cached)
        // Check if cache is still valid (24 hours)
        if (Date.now() - location.timestamp < 24 * 60 * 60 * 1000) {
          return location
        } else {
          localStorage.removeItem('confirmedLocation')
        }
      }
      return null
    } catch (error) {
      console.error('Get confirmed location error:', error)
      return null
    }
  },

  // Clear confirmed location cache
  clearConfirmedLocation: () => {
    localStorage.removeItem('confirmedLocation')
  }
}