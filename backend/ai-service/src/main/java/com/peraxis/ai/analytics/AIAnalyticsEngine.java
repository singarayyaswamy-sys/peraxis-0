package com.peraxis.ai.analytics;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class AIAnalyticsEngine {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    public Map<String, Object> generatePredictiveAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        List<Map> revenueData = getRevenueData();
        double predictedRevenue = predictRevenue(revenueData);
        
        Map<String, Object> userBehavior = analyzeUserBehavior();
        List<Map<String, Object>> recommendations = generateProductRecommendations();
        List<Map<String, Object>> anomalies = detectAnomalies();
        Map<String, Object> marketTrends = analyzeMarketTrends();
        
        analytics.put("predictedRevenue", predictedRevenue);
        analytics.put("userBehavior", userBehavior);
        analytics.put("recommendations", recommendations);
        analytics.put("anomalies", anomalies);
        analytics.put("marketTrends", marketTrends);
        analytics.put("confidence", calculateConfidenceScore());
        analytics.put("timestamp", System.currentTimeMillis());
        
        return analytics;
    }
    
    private double predictRevenue(List<Map> revenueData) {
        if (revenueData.size() < 2) return 0.0;
        
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        int n = revenueData.size();
        
        for (int i = 0; i < n; i++) {
            double x = i + 1;
            double y = ((Number) revenueData.get(i).getOrDefault("revenue", 0)).doubleValue();
            
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }
        
        double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        double intercept = (sumY - slope * sumX) / n;
        
        return slope * (n + 1) + intercept;
    }
    
    private Map<String, Object> analyzeUserBehavior() {
        Map<String, Object> behavior = new HashMap<>();
        
        List<Map> activities = mongoTemplate.findAll(Map.class, "user_activities");
        
        Map<String, Long> actionCounts = activities.stream()
            .collect(Collectors.groupingBy(
                activity -> (String) activity.getOrDefault("action", "unknown"),
                Collectors.counting()
            ));
        
        behavior.put("actionCounts", actionCounts);
        behavior.put("totalUsers", mongoTemplate.count(new Query(), "users"));
        behavior.put("activeUsers", calculateActiveUsers());
        
        return behavior;
    }
    
    private List<Map<String, Object>> generateProductRecommendations() {
        List<Map<String, Object>> recommendations = new ArrayList<>();
        
        List<Map> interactions = mongoTemplate.find(
            new Query(Criteria.where("action").in("view", "purchase", "cart_add")),
            Map.class, "user_activities"
        );
        
        Map<String, Double> productScores = new HashMap<>();
        
        interactions.forEach(interaction -> {
            String productId = (String) interaction.get("productId");
            String action = (String) interaction.get("action");
            
            if (productId != null) {
                double score = 0;
                switch (action) {
                    case "view": score = 1.0; break;
                    case "cart_add": score = 3.0; break;
                    case "purchase": score = 5.0; break;
                }
                productScores.merge(productId, score, Double::sum);
            }
        });
        
        productScores.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(10)
            .forEach(entry -> {
                Map<String, Object> recommendation = new HashMap<>();
                recommendation.put("productId", entry.getKey());
                recommendation.put("score", entry.getValue());
                recommendation.put("reason", "High user engagement");
                recommendations.add(recommendation);
            });
        
        return recommendations;
    }
    
    private List<Map<String, Object>> detectAnomalies() {
        List<Map<String, Object>> anomalies = new ArrayList<>();
        
        List<Map> orders = mongoTemplate.findAll(Map.class, "orders");
        
        if (!orders.isEmpty()) {
            double avgOrderValue = orders.stream()
                .mapToDouble(order -> {
                    Object total = order.get("total");
                    return total instanceof Number ? ((Number) total).doubleValue() : 0.0;
                })
                .average()
                .orElse(0.0);
            
            double threshold = avgOrderValue * 3;
            
            orders.stream()
                .filter(order -> {
                    Object total = order.get("total");
                    return total instanceof Number && ((Number) total).doubleValue() > threshold;
                })
                .limit(5)
                .forEach(order -> {
                    Map<String, Object> anomaly = new HashMap<>();
                    anomaly.put("type", "high_value_order");
                    anomaly.put("orderId", order.get("_id"));
                    anomaly.put("value", order.get("total"));
                    anomaly.put("severity", "medium");
                    anomalies.add(anomaly);
                });
        }
        
        return anomalies;
    }
    
    private Map<String, Object> analyzeMarketTrends() {
        Map<String, Object> trends = new HashMap<>();
        
        List<Map> products = mongoTemplate.findAll(Map.class, "products");
        
        Map<String, Long> categoryTrends = products.stream()
            .collect(Collectors.groupingBy(
                product -> (String) product.getOrDefault("category", "uncategorized"),
                Collectors.counting()
            ));
        
        trends.put("categoryDistribution", categoryTrends);
        
        return trends;
    }
    
    private List<Map> getRevenueData() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long timestamp = thirtyDaysAgo.toEpochSecond(ZoneOffset.UTC);
        
        Query query = new Query(Criteria.where("created_at").gte(timestamp));
        return mongoTemplate.find(query, Map.class, "orders");
    }
    
    private long calculateActiveUsers() {
        LocalDateTime lastWeek = LocalDateTime.now().minusDays(7);
        long timestamp = lastWeek.toEpochSecond(ZoneOffset.UTC);
        
        Query query = new Query(Criteria.where("timestamp").gte(timestamp));
        List<String> activeUserIds = mongoTemplate.findDistinct(query, "userId", "user_activities", String.class);
        
        return activeUserIds.size();
    }
    
    private double calculateConfidenceScore() {
        long totalOrders = mongoTemplate.count(new Query(), "orders");
        long totalUsers = mongoTemplate.count(new Query(), "users");
        long totalActivities = mongoTemplate.count(new Query(), "user_activities");
        
        double dataQualityScore = Math.min(1.0, (totalOrders + totalUsers + totalActivities) / 10000.0);
        return Math.round(dataQualityScore * 100.0) / 100.0;
    }
}