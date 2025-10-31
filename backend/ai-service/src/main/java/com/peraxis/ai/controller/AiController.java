package com.peraxis.ai.controller;

import com.peraxis.ai.dto.ChatRequest;
import com.peraxis.ai.dto.RecommendationRequest;
import com.peraxis.ai.service.GeminiService;
import com.peraxis.ai.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
// @CrossOrigin - Handled by Gateway
public class AiController {
    
    @Autowired
    private GeminiService geminiService;
    
    @Autowired
    private RecommendationService recommendationService;
    
    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        try {
            String response = geminiService.generateResponse(request.getMessage(), request.getContext());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "response", response,
                "suggestions", geminiService.generateSuggestions(request.getMessage())
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "AI service temporarily unavailable"
            ));
        }
    }
    
    @PostMapping("/chat/public")
    public ResponseEntity<?> publicChat(@RequestBody ChatRequest request) {
        try {
            String response = geminiService.generatePublicResponse(request.getMessage());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "response", response
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "response", "I'm here to help! Could you please rephrase your question?"
            ));
        }
    }
    
    @PostMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(
            @RequestBody RecommendationRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        try {
            var recommendations = recommendationService.getPersonalizedRecommendations(
                userId, request.getCategory(), request.getLimit());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "recommendations", recommendations
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String productId,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            var recommendations = recommendationService.getPersonalizedRecommendations(
                userId, null, limit);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", recommendations
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", java.util.Collections.emptyList()
            ));
        }
    }
    
    @GetMapping("/recommendations/trending")
    public ResponseEntity<?> getTrendingRecommendations(@RequestParam(defaultValue = "10") int limit) {
        try {
            var recommendations = recommendationService.getTrendingRecommendations(limit);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "recommendations", recommendations
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @PostMapping("/generate-description")
    public ResponseEntity<?> generateProductDescription(@RequestBody Map<String, Object> productData) {
        try {
            String description = geminiService.generateProductDescription(productData);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "description", description
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/health")
    public String health() {
        return "AI Service is running";
    }
}
