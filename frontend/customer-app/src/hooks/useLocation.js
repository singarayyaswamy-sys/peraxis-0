import { useState, useEffect } from 'react';
import { locationService } from '../services/locationService';
import { useLocationStore } from '../store/locationStore';

export const useLocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setLocation, setIsLocationLoading } = useLocationStore();

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setIsLocationLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Call backend to reverse geocode
      const locationData = await locationService.reverseGeocode(latitude, longitude);
      
      if (locationData) {
        setLocation({
          address: locationData.address,
          city: locationData.city,
          state: locationData.state,
          pincode: locationData.pincode,
          coordinates: { lat: latitude, lng: longitude }
        });
      } else {
        throw new Error('Unable to determine location from coordinates');
      }
    } catch (err) {
      setError(err.message);
      console.error('Location error:', err);
    } finally {
      setIsLoading(false);
      setIsLocationLoading(false);
    }
  };

  const searchPlaces = async (query) => {
    if (!query || query.trim().length < 2) return [];
    
    try {
      const results = await locationService.searchPlaces(query);
      return results || [];
    } catch (err) {
      console.error('Search places error:', err);
      return [];
    }
  };

  const selectPlace = async (place) => {
    setIsLoading(true);
    setError(null);

    try {
      let locationData;
      
      if (place.placeId) {
        // If we have a place ID, we could get details, but for now use description
        locationData = await locationService.geocode(place.description);
      } else {
        locationData = await locationService.geocode(place.description);
      }

      if (locationData) {
        setLocation({
          address: locationData.address,
          city: locationData.city,
          state: locationData.state,
          pincode: locationData.pincode,
          coordinates: { 
            lat: locationData.latitude, 
            lng: locationData.longitude 
          }
        });
      } else {
        throw new Error('Unable to geocode selected place');
      }
    } catch (err) {
      setError(err.message);
      console.error('Select place error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getCurrentLocation,
    searchPlaces,
    selectPlace
  };
};