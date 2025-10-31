package com.peraxis.location.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@Service
public class SecureMapService {
    
    @Value("${google.maps.api.key}")
    private String googleMapsApiKey;
    
    public String generateMapScript() {
        return String.format(
            "(function() { " +
            "const script = document.createElement('script'); " +
            "script.src = 'https://maps.googleapis.com/maps/api/js?key=%s&libraries=places'; " +
            "script.async = true; " +
            "script.onload = function() { window.googleMapsLoaded = true; }; " +
            "document.head.appendChild(script); " +
            "})();", 
            googleMapsApiKey
        );
    }
    
    public java.util.Map<String, Object> getSecureMapConfig() {
        java.util.Map<String, Object> config = new java.util.HashMap<>();
        config.put("mapId", "peraxis-location-map");
        config.put("center", java.util.Map.of("lat", 28.6139, "lng", 77.2090));
        config.put("zoom", 15);
        return config;
    }
}

@RestController
@RequestMapping("/api/location")
class SecureMapController {
    
    private final SecureMapService secureMapService;
    
    public SecureMapController(SecureMapService secureMapService) {
        this.secureMapService = secureMapService;
    }
    
    @GetMapping("/map-script")
    public ResponseEntity<String> getMapScript() {
        try {
            String script = secureMapService.generateMapScript();
            return ResponseEntity.ok()
                .header("Content-Type", "application/javascript")
                .body(script);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/map-config")
    public ResponseEntity<?> getMapConfig() {
        try {
            return ResponseEntity.ok(secureMapService.getSecureMapConfig());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}