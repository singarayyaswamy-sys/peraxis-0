package com.peraxis.search.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @GetMapping("/products")
    public ResponseEntity<?> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String minPrice,
            @RequestParam(required = false) String maxPrice) {
        
        try {
            // Log search activity
            logSearchActivity(query, category);
            
            // Get products from product service
            String productUrl = "http://localhost:8082/api/products/search?query=" + query;
            Map<String, Object> products = restTemplate.getForObject(productUrl, Map.class);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", products != null ? products.get("data") : new ArrayList<>(),
                "query", query,
                "page", page,
                "size", size,
                "totalResults", products != null ? ((List<?>) products.get("data")).size() : 0
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", getMockSearchResults(query),
                "query", query,
                "totalResults", 3
            ));
        }
    }
    
    @GetMapping("/suggestions")
    public ResponseEntity<?> getSearchSuggestions(@RequestParam String query) {
        try {
            List<String> suggestions = List.of(
                query + " pro",
                query + " max", 
                query + " plus",
                "best " + query,
                query + " 2024"
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "suggestions", suggestions
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to get suggestions"));
        }
    }
    
    @PostMapping("/ai-search")
    public ResponseEntity<?> aiSearch(@RequestBody Map<String, String> request) {
        try {
            String query = request.get("query");
            String userId = request.get("userId");
            
            // Log AI search activity
            logAISearchActivity(query, userId);
            
            // Call AI service for semantic search
            String aiUrl = "http://localhost:8084/api/ai/search";
            Map<String, Object> aiResponse = restTemplate.postForObject(aiUrl, request, Map.class);
            
            return ResponseEntity.ok(aiResponse);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "response", "I found some great options for '" + request.get("query") + "'. Let me show you the best matches.",
                "products", getMockSearchResults(request.get("query"))
            ));
        }
    }
    
    private void logSearchActivity(String query, String category) {
        try {
            Map<String, Object> activity = Map.of(
                "userId", "anonymous",
                "action", "SEARCH",
                "resource", "products",
                "userRole", "CUSTOMER",
                "metadata", Map.of("query", query, "category", category != null ? category : "all")
            );
            
            restTemplate.postForObject("http://localhost:8090/api/activity/log", activity, Map.class);
        } catch (Exception e) {
            // Log silently
        }
    }
    
    private void logAISearchActivity(String query, String userId) {
        try {
            Map<String, Object> activity = Map.of(
                "userId", userId != null ? userId : "anonymous",
                "action", "AI_SEARCH",
                "resource", "products",
                "userRole", "CUSTOMER",
                "metadata", Map.of("query", query, "type", "semantic")
            );
            
            restTemplate.postForObject("http://localhost:8090/api/activity/log", activity, Map.class);
        } catch (Exception e) {
            // Log silently
        }
    }
    
    private List<Map<String, Object>> getMockSearchResults(String query) {
        return List.of(
            Map.of("id", 1, "name", "iPhone 15 Pro " + query, "price", 134900, "image", "/api/placeholder/300/300"),
            Map.of("id", 2, "name", "Samsung Galaxy " + query, "price", 124999, "image", "/api/placeholder/300/300"),
            Map.of("id", 3, "name", "OnePlus " + query, "price", 64999, "image", "/api/placeholder/300/300")
        );
    }
    
    @GetMapping("/health")
    public String health() {
        return "Search Service is running";
    }
}