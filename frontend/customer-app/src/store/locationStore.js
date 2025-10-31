import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { locationService } from '../services/locationService'

export const useLocationStore = create(
  persist(
    (set, get) => {
      const actions = {
      currentLocation: null,
      isLocationLoading: false,
      isLocationModalOpen: false,
      hasLocationPermission: null,
      serviceableAreas: [],
      deliveryEstimates: {},
      savedAddresses: [],
      recentSearches: [],
      isLocationConfirmed: false,

      setLocation: (location) => {
        set({ currentLocation: location })
        get().checkServiceability(location.pincode)
      },

      setIsLocationLoading: (loading) => set({ isLocationLoading: loading }),

      openLocationModal: () => set({ isLocationModalOpen: true }),
      closeLocationModal: () => set({ isLocationModalOpen: false }),

      detectCurrentLocation: async () => {
        set({ isLocationLoading: true })
        
        if (!navigator.geolocation) {
          set({ isLocationLoading: false, hasLocationPermission: false })
          return { success: false, error: 'Geolocation not supported' }
        }

        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              
              try {
                const location = await locationService.reverseGeocode(latitude, longitude)
                
                set({ 
                  currentLocation: location,
                  isLocationLoading: false,
                  hasLocationPermission: true,
                  isLocationModalOpen: false
                })
                
                get().checkServiceability(location.pincode)
                resolve({ success: true, location })
              } catch (error) {
                set({ isLocationLoading: false })
                resolve({ success: false, error: error.message })
              }
            },
            (error) => {
              set({ isLocationLoading: false, hasLocationPermission: false })
              resolve({ success: false, error: error.message })
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
          )
        })
      },

      searchLocation: async (query) => {
        try {
          const results = await locationService.searchPlaces(query)
          return { success: true, results: results || [] }
        } catch (error) {
          return { success: false, error: error.message }
        }
      },

      geocodeAddress: async (address) => {
        set({ isLocationLoading: true })
        try {
          const location = await locationService.geocode(address)
          
          set({ 
            currentLocation: location,
            isLocationLoading: false,
            isLocationModalOpen: false
          })
          
          // Add to recent searches
          get().addRecentSearch(location)
          
          get().checkServiceability(location.pincode)
          return { success: true, location }
        } catch (error) {
          set({ isLocationLoading: false })
          return { success: false, error: error.message }
        }
      },

      checkServiceability: async (pincode) => {
        try {
          const response = await locationService.checkServiceability(pincode)
          const { serviceable, deliveryDays } = response.data
          
          if (serviceable) {
            set(state => ({
              serviceableAreas: [...new Set([...state.serviceableAreas, pincode])]
            }))
          }
          
          return { serviceable, deliveryDays }
        } catch (error) {
          return { serviceable: false, error: error.message }
        }
      },

      getDeliveryEstimate: async (productId, pincode = null) => {
        const targetPincode = pincode || get().currentLocation?.pincode
        if (!targetPincode) return null

        const cacheKey = `${productId}-${targetPincode}`
        const cached = get().deliveryEstimates[cacheKey]
        
        if (cached && Date.now() - cached.timestamp < 300000) { // 5 min cache
          return cached.estimate
        }

        try {
          const response = await locationService.getDeliveryEstimate(productId, targetPincode)
          const estimate = response.data
          
          set(state => ({
            deliveryEstimates: {
              ...state.deliveryEstimates,
              [cacheKey]: { estimate, timestamp: Date.now() }
            }
          }))
          
          return estimate
        } catch (error) {
          return null
        }
      },

      saveCurrentAddress: async (label = 'Home') => {
        const { currentLocation } = get()
        if (!currentLocation) return { success: false, error: 'No location selected' }

        try {
          const addressData = {
            label,
            address: currentLocation.address,
            city: currentLocation.city,
            state: currentLocation.state,
            pincode: currentLocation.pincode,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude
          }

          const savedAddress = await locationService.saveAddress(addressData)
          
          set(state => ({
            savedAddresses: [...state.savedAddresses, savedAddress]
          }))
          
          return { success: true }
        } catch (error) {
          if (error.response?.status === 400) {
            return { success: false, error: 'Please login to save addresses' }
          }
          return { success: false, error: error.message }
        }
      },

      removeSavedAddress: async (id) => {
        try {
          const success = await locationService.deleteSavedAddress(id)
          if (success) {
            set(state => ({
              savedAddresses: state.savedAddresses.filter(addr => addr.id !== id)
            }))
          }
          return { success }
        } catch (error) {
          return { success: false, error: error.message }
        }
      },

      selectSavedAddress: (savedAddress) => {
        const location = {
          address: savedAddress.address,
          city: savedAddress.city,
          state: savedAddress.state,
          pincode: savedAddress.pincode,
          latitude: savedAddress.coordinates?.lat || savedAddress.latitude,
          longitude: savedAddress.coordinates?.lng || savedAddress.longitude
        }
        set({ currentLocation: location })
        get().checkServiceability(location.pincode)
      },

      addRecentSearch: (location) => {
        const recentSearch = {
          id: Date.now().toString(),
          address: location.address,
          city: location.city,
          state: location.state,
          pincode: location.pincode,
          coordinates: {
            lat: location.latitude,
            lng: location.longitude
          },
          searchedAt: new Date().toISOString()
        }

        set(state => {
          const filtered = state.recentSearches.filter(s => s.address !== location.address)
          return {
            recentSearches: [recentSearch, ...filtered].slice(0, 5) // Keep only 5 recent
          }
        })
      },

      selectRecentSearch: (recentSearch) => {
        const location = {
          address: recentSearch.address,
          city: recentSearch.city,
          state: recentSearch.state,
          pincode: recentSearch.pincode,
          latitude: recentSearch.coordinates.lat,
          longitude: recentSearch.coordinates.lng
        }
        set({ currentLocation: location })
        get().checkServiceability(location.pincode)
      },

      loadSavedAddresses: async () => {
        try {
          const addresses = await locationService.getSavedAddresses()
          set({ savedAddresses: addresses })
          return { success: true }
        } catch (error) {
          return { success: false, error: error.message }
        }
      },

      clearLocation: () => {
        set({
          currentLocation: null,
          serviceableAreas: [],
          deliveryEstimates: {}
        })
        locationService.clearConfirmedLocation()
      },

      confirmCurrentLocation: async () => {
        const { currentLocation } = get()
        if (!currentLocation) return { success: false, error: 'No location selected' }

        try {
          await locationService.confirmLocation(currentLocation)
          return { success: true }
        } catch (error) {
          return { success: false, error: error.message }
        }
      },

      loadConfirmedLocation: () => {
        const confirmedLocation = locationService.getConfirmedLocation()
        if (confirmedLocation) {
          set({ currentLocation: confirmedLocation })
          get().checkServiceability(confirmedLocation.pincode)
          return true
        }
        return false
      }
      }
      
      // Expose actions globally for auth store
      if (typeof window !== 'undefined') {
        window.locationStoreActions = actions
      }
      
      return actions
    },
    {
      name: 'peraxis-location',
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        hasLocationPermission: state.hasLocationPermission,
        serviceableAreas: state.serviceableAreas,
        savedAddresses: state.savedAddresses,
        recentSearches: state.recentSearches
      })
    }
  )
)