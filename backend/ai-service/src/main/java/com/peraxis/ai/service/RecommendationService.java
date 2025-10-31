package com.peraxis.ai.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class RecommendationService {
    
    public List<Map<String, Object>> getPersonalizedRecommendations(String userId, String category, int limit) {
        // Mock recommendations - replace with actual ML logic
        return List.of(
            Map.of(
                "id", "rec1",
                "name", "AI Recommended Phone",
                "price", 25999,
                "image", "/api/placeholder/200/200",
                "rating", 4.6,
                "reason", "Based on your browsing history"
            ),
            Map.of(
                "id", "rec2", 
                "name", "Perfect Match Laptop",
                "price", 65999,
                "image", "/api/placeholder/200/200",
                "rating", 4.8,
                "reason", "Similar users also bought"
            )
        );
    }
    
    public List<Map<String, Object>> getTrendingRecommendations(int limit) {
        return List.of(
            Map.of(
                "id", "trend1",
                "name", "Trending Headphones",
                "price", 8999,
                "image", "/api/placeholder/200/200",
                "rating", 4.5,
                "trend", "+25%"
            )
        );
    }
}
