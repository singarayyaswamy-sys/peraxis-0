package com.peraxis.websocket.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class DatabaseIntegrationService {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    public void saveUserActivity(String userId, String action, Map<String, Object> data) {
        Map<String, Object> activity = new HashMap<>();
        activity.put("userId", userId);
        activity.put("action", action);
        activity.put("data", data);
        activity.put("timestamp", LocalDateTime.now());
        activity.put("sessionId", data.get("sessionId"));
        
        // Save to MongoDB
        mongoTemplate.save(activity, "user_activities");
        
        // Cache recent activity in Redis
        String key = "user:activity:" + userId;
        redisTemplate.opsForList().leftPush(key, activity);
        redisTemplate.opsForList().trim(key, 0, 99); // Keep last 100 activities
        redisTemplate.expire(key, 24, TimeUnit.HOURS);
    }
    
    public void saveChatMessage(String userId, String room, String message, String type) {
        Map<String, Object> chatData = new HashMap<>();
        chatData.put("userId", userId);
        chatData.put("room", room);
        chatData.put("message", message);
        chatData.put("type", type);
        chatData.put("timestamp", LocalDateTime.now());
        
        // Save to MongoDB
        mongoTemplate.save(chatData, "chat_messages");
        
        // Cache in Redis for quick retrieval
        String key = "chat:" + room;
        redisTemplate.opsForList().leftPush(key, chatData);
        redisTemplate.opsForList().trim(key, 0, 499); // Keep last 500 messages
        redisTemplate.expire(key, 7, TimeUnit.DAYS);
    }
    
    public void updateProductViews(String productId, String userId) {
        // Update view count in Redis
        redisTemplate.opsForHash().increment("product:views", productId, 1);
        redisTemplate.opsForHash().increment("product:views:daily", productId, 1);
        
        // Save detailed view data to MongoDB
        Map<String, Object> viewData = new HashMap<>();
        viewData.put("productId", productId);
        viewData.put("userId", userId);
        viewData.put("timestamp", LocalDateTime.now());
        viewData.put("date", LocalDateTime.now().toLocalDate().toString());
        
        mongoTemplate.save(viewData, "product_views");
    }
    
    public void saveUserPresence(String userId, String status) {
        Map<String, Object> presence = new HashMap<>();
        presence.put("userId", userId);
        presence.put("status", status);
        presence.put("timestamp", LocalDateTime.now());
        
        // Update in Redis for real-time access
        redisTemplate.opsForHash().put("user:presence", userId, presence);
        
        // Save to MongoDB for analytics
        mongoTemplate.save(presence, "user_presence");
    }
    
    public List<Map> getRecentChatMessages(String room, int limit) {
        String key = "chat:" + room;
        List<Object> messages = redisTemplate.opsForList().range(key, 0, limit - 1);
        
        if (messages == null || messages.isEmpty()) {
            // Fallback to MongoDB
            Query query = new Query(Criteria.where("room").is(room))
                    .limit(limit)
                    .with(org.springframework.data.domain.Sort.by(
                            org.springframework.data.domain.Sort.Direction.DESC, "timestamp"));
            return mongoTemplate.find(query, Map.class, "chat_messages");
        }
        
        return (List<Map>) (List<?>) messages;
    }
    
    public Map<String, Object> getProductAnalytics(String productId) {
        Map<String, Object> analytics = new HashMap<>();
        
        // Get view count from Redis
        Object viewCount = redisTemplate.opsForHash().get("product:views", productId);
        Object dailyViews = redisTemplate.opsForHash().get("product:views:daily", productId);
        
        analytics.put("totalViews", viewCount != null ? viewCount : 0);
        analytics.put("dailyViews", dailyViews != null ? dailyViews : 0);
        
        // Get unique viewers from MongoDB
        Query query = new Query(Criteria.where("productId").is(productId));
        List<String> uniqueViewers = mongoTemplate.findDistinct(query, "userId", "product_views", String.class);
        analytics.put("uniqueViewers", uniqueViewers.size());
        
        return analytics;
    }
    
    public void saveAIInteraction(String userId, String query, String response, String context) {
        Map<String, Object> interaction = new HashMap<>();
        interaction.put("userId", userId);
        interaction.put("query", query);
        interaction.put("response", response);
        interaction.put("context", context);
        interaction.put("timestamp", LocalDateTime.now());
        
        // Save to MongoDB for AI training and analytics
        mongoTemplate.save(interaction, "ai_interactions");
        
        // Update user AI usage stats in Redis
        String key = "user:ai:stats:" + userId;
        redisTemplate.opsForHash().increment(key, "totalQueries", 1);
        redisTemplate.opsForHash().increment(key, "queriesDaily", 1);
        redisTemplate.expire(key, 30, TimeUnit.DAYS);
    }
    
    public void cleanupExpiredData() {
        // Clean up daily view counts (reset daily)
        redisTemplate.delete("product:views:daily");
        
        // Clean up old presence data
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        Query oldPresenceQuery = new Query(Criteria.where("timestamp").lt(cutoff));
        mongoTemplate.remove(oldPresenceQuery, "user_presence");
        
        // Clean up old activities (keep last 30 days)
        LocalDateTime activityCutoff = LocalDateTime.now().minusDays(30);
        Query oldActivityQuery = new Query(Criteria.where("timestamp").lt(activityCutoff));
        mongoTemplate.remove(oldActivityQuery, "user_activities");
    }
}