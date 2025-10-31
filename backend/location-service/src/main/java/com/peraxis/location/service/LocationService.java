package com.peraxis.location.service;

import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.PlacesApi;
import com.google.maps.PlaceAutocompleteRequest;
import com.google.maps.model.*;
import com.peraxis.location.dto.*;
import com.peraxis.location.model.SavedAddress;
import com.peraxis.location.model.ServiceableZone;
import com.peraxis.location.model.Warehouse;
import com.peraxis.location.repository.SavedAddressRepository;
import com.peraxis.location.repository.ServiceableZoneRepository;
import com.peraxis.location.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LocationService {

    @Autowired
    private GeoApiContext geoApiContext;

    @Autowired
    private ServiceableZoneRepository serviceableZoneRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private SavedAddressRepository savedAddressRepository;

    /**
     * Geocode address using Google Maps API
     */
    public LocationResponse geocodeAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            return null;
        }

        try {
            GeocodingResult[] results = GeocodingApi.geocode(geoApiContext, address)
                    .region("in") // Bias results to India
                    .await();

            if (results != null && results.length > 0) {
                return parseGoogleResult(results[0]);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Reverse geocode coordinates using Google Maps API
     */
    public LocationResponse reverseGeocode(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return null;
        }

        try {
            LatLng latLng = new LatLng(latitude, longitude);
            GeocodingResult[] results = GeocodingApi.reverseGeocode(geoApiContext, latLng).await();

            if (results != null && results.length > 0) {
                return parseGoogleResult(results[0]);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Get place autocomplete suggestions using Google Places API
     */
    public List<PlaceAutocompleteResponse> getPlaceAutocomplete(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        try {
            PlaceAutocompleteRequest.SessionToken sessionToken = new PlaceAutocompleteRequest.SessionToken();
            AutocompletePrediction[] predictions = PlacesApi.placeAutocomplete(geoApiContext, query, sessionToken)
                    .components(ComponentFilter.country("in")) // Restrict to India
                    .await();

            return Arrays.stream(predictions)
                    .map(this::convertToPlaceResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            // Fallback to mock data
            return getMockPlaceResults(query);
        }
    }

    /**
     * Fallback mock search results with pincode support
     */
    private List<PlaceAutocompleteResponse> getMockPlaceResults(String query) {
        List<PlaceAutocompleteResponse> results = new java.util.ArrayList<>();
        String lowerQuery = query.toLowerCase().trim();
        
        // Check if query is a pincode (6 digits)
        if (lowerQuery.matches("\\d{6}")) {
            PlaceAutocompleteResponse response = new PlaceAutocompleteResponse();
            response.setDescription("Pincode " + query + ", India");
            response.setPlaceId("pincode_" + query);
            
            PlaceAutocompleteResponse.StructuredFormatting formatting = 
                new PlaceAutocompleteResponse.StructuredFormatting();
            formatting.setMainText("Pincode " + query);
            formatting.setSecondaryText("India");
            response.setStructuredFormatting(formatting);
            
            results.add(response);
            return results;
        }
        
        // City data with pincodes
        String[][] cityData = {
            {"Delhi", "110001"}, {"Mumbai", "400001"}, {"Bangalore", "560001"}, 
            {"Hyderabad", "500001"}, {"Chennai", "600001"}, {"Kolkata", "700001"}, 
            {"Pune", "411001"}, {"Gurgaon", "122001"}, {"Noida", "201301"}
        };
        
        for (String[] cityInfo : cityData) {
            String city = cityInfo[0];
            String pincode = cityInfo[1];
            
            if (city.toLowerCase().contains(lowerQuery) || lowerQuery.contains(city.toLowerCase())) {
                PlaceAutocompleteResponse response = new PlaceAutocompleteResponse();
                response.setDescription(city + " - " + pincode + ", India");
                response.setPlaceId("mock_" + city.toLowerCase());
                
                PlaceAutocompleteResponse.StructuredFormatting formatting = 
                    new PlaceAutocompleteResponse.StructuredFormatting();
                formatting.setMainText(city);
                formatting.setSecondaryText(pincode + ", India");
                response.setStructuredFormatting(formatting);
                
                results.add(response);
            }
        }
        
        if (results.isEmpty()) {
            PlaceAutocompleteResponse response = new PlaceAutocompleteResponse();
            response.setDescription(query + ", India");
            response.setPlaceId("mock_" + query.toLowerCase().replaceAll("\\s+", "_"));
            
            PlaceAutocompleteResponse.StructuredFormatting formatting = 
                new PlaceAutocompleteResponse.StructuredFormatting();
            formatting.setMainText(query);
            formatting.setSecondaryText("India");
            response.setStructuredFormatting(formatting);
            
            results.add(response);
        }
        
        return results;
    }

    /**
     * Get saved addresses for user
     */
    public List<SavedAddress> getSavedAddresses(Long userId) {
        return savedAddressRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Save address for user
     */
    public SavedAddress saveAddress(Long userId, SavedAddressRequest request) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (request == null) {
            throw new IllegalArgumentException("Address request cannot be null");
        }
        if (request.getLabel() == null || request.getLabel().trim().isEmpty()) {
            throw new IllegalArgumentException("Address label cannot be null or empty");
        }
        if (request.getAddress() == null || request.getAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Address cannot be null or empty");
        }
        
        try {
            SavedAddress savedAddress = new SavedAddress(
                userId,
                request.getLabel().trim(),
                request.getAddress().trim(),
                request.getCity() != null ? request.getCity().trim() : null,
                request.getState() != null ? request.getState().trim() : null,
                request.getPincode() != null ? request.getPincode().trim() : null,
                request.getLatitude(),
                request.getLongitude()
            );
            return savedAddressRepository.save(savedAddress);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save address: " + e.getMessage(), e);
        }
    }

    /**
     * Delete saved address
     */
    public void deleteSavedAddress(Long userId, Long addressId) {
        savedAddressRepository.deleteByIdAndUserId(addressId, userId);
    }

    @Cacheable(value = "serviceability", key = "#pincode")
    public DeliveryEstimateResponse checkServiceability(String pincode) {
        Optional<ServiceableZone> zone = serviceableZoneRepository.findByPincode(pincode);
        
        if (zone.isPresent() && zone.get().getServiceable()) {
            ServiceableZone sz = zone.get();
            return new DeliveryEstimateResponse(
                true, 
                sz.getDeliveryDays(), 
                sz.getDeliveryCharge(), 
                false
            );
        }
        
        return new DeliveryEstimateResponse(false, null, null, false);
    }

    @Cacheable(value = "deliveryEstimate", key = "#productId + '_' + #pincode")
    public DeliveryEstimateResponse getDeliveryEstimate(Long productId, String pincode) {
        DeliveryEstimateResponse serviceability = checkServiceability(pincode);
        
        if (!serviceability.getServiceable()) {
            return serviceability;
        }

        Optional<ServiceableZone> zone = serviceableZoneRepository.findByPincode(pincode);
        if (zone.isPresent()) {
            ServiceableZone sz = zone.get();
            boolean freeDelivery = false;
            
            serviceability.setFreeDelivery(freeDelivery);
            serviceability.setNearestWarehouse("Main Warehouse - " + sz.getCity());
            
            return serviceability;
        }
        
        return new DeliveryEstimateResponse(false, null, null, false);
    }

    public List<Warehouse> getNearbyWarehouses(Double latitude, Double longitude, Double radiusKm) {
        return warehouseRepository.findNearbyWarehouses(latitude, longitude, radiusKm, 10);
    }

    /**
     * Parse Google Geocoding result to LocationResponse
     */
    private LocationResponse parseGoogleResult(GeocodingResult result) {
        String address = result.formattedAddress;
        Double lat = result.geometry.location.lat;
        Double lng = result.geometry.location.lng;
        
        String city = "";
        String state = "";
        String pincode = "";
        
        for (AddressComponent component : result.addressComponents) {
            List<String> types = Arrays.stream(component.types)
                    .map(AddressComponentType::toString)
                    .collect(Collectors.toList());
                    
            if (types.contains("locality") || types.contains("administrative_area_level_2")) {
                if (city.isEmpty()) city = component.longName;
            } else if (types.contains("administrative_area_level_1")) {
                state = component.longName;
            } else if (types.contains("postal_code")) {
                pincode = component.longName;
            }
        }
        
        // Fallback: extract pincode from address if not found
        if (pincode.isEmpty()) {
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\b(\\d{6})\\b");
            java.util.regex.Matcher matcher = pattern.matcher(address);
            if (matcher.find()) {
                pincode = matcher.group(1);
            }
        }
        
        // Default pincode for major cities if still empty
        if (pincode.isEmpty() && !city.isEmpty()) {
            switch (city.toLowerCase()) {
                case "hyderabad": pincode = "500001"; break;
                case "delhi": pincode = "110001"; break;
                case "mumbai": pincode = "400001"; break;
                case "bangalore": case "bengaluru": pincode = "560001"; break;
                case "chennai": pincode = "600001"; break;
                case "kolkata": pincode = "700001"; break;
                case "pune": pincode = "411001"; break;
            }
        }
        
        return new LocationResponse(address, city, state, pincode, lat, lng);
    }

    /**
     * Convert AutocompletePrediction to PlaceAutocompleteResponse
     */
    private PlaceAutocompleteResponse convertToPlaceResponse(AutocompletePrediction prediction) {
        PlaceAutocompleteResponse response = new PlaceAutocompleteResponse();
        response.setDescription(prediction.description);
        response.setPlaceId(prediction.placeId);
        
        if (prediction.structuredFormatting != null) {
            PlaceAutocompleteResponse.StructuredFormatting formatting = 
                new PlaceAutocompleteResponse.StructuredFormatting();
            formatting.setMainText(prediction.structuredFormatting.mainText);
            formatting.setSecondaryText(prediction.structuredFormatting.secondaryText);
            response.setStructuredFormatting(formatting);
        }
        
        return response;
    }
}