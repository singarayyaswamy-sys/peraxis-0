package com.peraxis.search.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class SearchService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    public List<Map<String, Object>> searchProducts(String query, Map<String, Object> filters) {
        // Cache search results
        String cacheKey = "search:" + query + ":" + filters.hashCode();
        List<Map<String, Object>> cachedResults = (List<Map<String, Object>>) redisTemplate.opsForValue().get(cacheKey);
        
        if (cachedResults != null) {
            return cachedResults;
        }
        
        // Mock search results - replace with actual Elasticsearch query
        List<Map<String, Object>> results = List.of(
            Map.of(
                "id", "1",
                "name", "iPhone 15 Pro",
                "price", 134900,
                "category", "Electronics",
                "rating", 4.8,
                "image", "/api/placeholder/200/200",
                "inStock", true,
                "relevanceScore", 0.95
            ),
            Map.of(
                "id", "2",
                "name", "Samsung Galaxy S24",
                "price", 124999,
                "category", "Electronics", 
                "rating", 4.6,
                "image", "/api/placeholder/200/200",
                "inStock", true,
                "relevanceScore", 0.87
            )
        );
        
        // Cache results for 5 minutes
        redisTemplate.opsForValue().set(cacheKey, results, 5, TimeUnit.MINUTES);
        
        // Log search query
        logSearchQuery(query, filters, results.size());
        
        return results;
    }
    
    public List<String> getSearchSuggestions(String query) {
        String cacheKey = "suggestions:" + query;
        List<String> cachedSuggestions = (List<String>) redisTemplate.opsForValue().get(cacheKey);
        
        if (cachedSuggestions != null) {
            return cachedSuggestions;
        }
        
        // Mock suggestions - replace with actual Elasticsearch suggestions
        List<String> suggestions = List.of(
            query + " pro",
            query + " max",
            query + " plus",
            query + " mini"
        );
        
        redisTemplate.opsForValue().set(cacheKey, suggestions, 10, TimeUnit.MINUTES);
        return suggestions;
    }
    
    public List<String> getTrendingSearches() {
        String cacheKey = "trending:searches";
        List<String> trending = (List<String>) redisTemplate.opsForValue().get(cacheKey);
        
        if (trending != null) {
            return trending;
        }
        
        // Mock trending searches
        trending = List.of(
            "iPhone 15",
            "Samsung Galaxy",
            "MacBook Air",
            "AirPods Pro",
            "iPad Pro"
        );
        
        redisTemplate.opsForValue().set(cacheKey, trending, 1, TimeUnit.HOURS);
        return trending;
    }
    
    private void logSearchQuery(String query, Map<String, Object> filters, int resultCount) {
        // Log to activity service
        Map<String, Object> searchLog = Map.of(
            "query", query,
            "filters", filters,
            "resultCount", resultCount,
            "timestamp", System.currentTimeMillis()
        );
        
        redisTemplate.opsForList().leftPush("search:logs", searchLog);
        redisTemplate.expire("search:logs", 7, TimeUnit.DAYS);
    }
}
