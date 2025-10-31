package com.peraxis.location.controller;

import com.peraxis.location.dto.*;
import com.peraxis.location.model.SavedAddress;
import com.peraxis.location.model.Warehouse;
import com.peraxis.location.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/location")
public class LocationController {

    @Autowired
    private LocationService locationService;
    


    @PostMapping("/geocode")
    public ResponseEntity<LocationResponse> geocode(@RequestBody LocationRequest request) {
        try {
            LocationResponse response = locationService.geocodeAddress(request.getAddress());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/reverse-geocode")
    public ResponseEntity<LocationResponse> reverseGeocode(@RequestBody LocationRequest request) {
        try {
            LocationResponse response = locationService.reverseGeocode(request.getLatitude(), request.getLongitude());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/serviceability")
    public ResponseEntity<DeliveryEstimateResponse> checkServiceability(@RequestParam String pincode) {
        try {
            DeliveryEstimateResponse response = locationService.checkServiceability(pincode);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/delivery-estimate")
    public ResponseEntity<DeliveryEstimateResponse> getDeliveryEstimate(
            @RequestParam Long productId,
            @RequestParam String pincode) {
        try {
            DeliveryEstimateResponse response = locationService.getDeliveryEstimate(productId, pincode);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/warehouses")
    public ResponseEntity<List<Warehouse>> getNearbyWarehouses(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "50") Double radius) {
        try {
            List<Warehouse> warehouses = locationService.getNearbyWarehouses(lat, lng, radius);
            return ResponseEntity.ok(warehouses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search-places")
    public ResponseEntity<?> searchPlaces(@RequestParam String query) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            List<com.peraxis.location.dto.PlaceAutocompleteResponse> results = 
                locationService.getPlaceAutocomplete(query);
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/saved-addresses")
    public ResponseEntity<List<SavedAddress>> getSavedAddresses(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        try {
            List<SavedAddress> addresses = locationService.getSavedAddresses(userId);
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/saved-addresses")
    public ResponseEntity<SavedAddress> saveAddress(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestBody SavedAddressRequest request) {
        try {
            SavedAddress savedAddress = locationService.saveAddress(userId, request);
            return ResponseEntity.ok(savedAddress);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/saved-addresses/{id}")
    public ResponseEntity<Void> deleteSavedAddress(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @PathVariable Long id) {
        try {
            locationService.deleteSavedAddress(userId, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmLocation(@RequestBody LocationRequest request) {
        try {
            // Cache the confirmed location for the user
            java.util.Map<String, Object> locationData = new java.util.HashMap<>();
            locationData.put("latitude", request.getLatitude());
            locationData.put("longitude", request.getLongitude());
            locationData.put("address", request.getAddress());
            locationData.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(java.util.Map.of(
                "success", true,
                "message", "Location confirmed successfully",
                "data", locationData
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "success", false,
                "message", "Failed to confirm location"
            ));
        }
    }
}