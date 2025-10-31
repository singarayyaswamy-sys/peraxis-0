package com.peraxis.activity.service;

import com.peraxis.activity.entity.UserActivity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ActivityService {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    public void logActivity(String userId, String action, String resource, String userRole, Map<String, Object> metadata) {
        UserActivity activity = new UserActivity();
        activity.setUserId(userId != null ? userId : "anonymous");
        activity.setUserRole(userRole != null ? userRole : "GUEST");
        activity.setAction(action != null ? action : "UNKNOWN");
        activity.setResource(resource != null ? resource : "unknown");
        activity.setMetadata(metadata != null ? metadata : new java.util.HashMap<>());
        activity.setTimestamp(LocalDateTime.now());
        
        mongoTemplate.save(activity, "user_activities");
    }
    
    public List<UserActivity> getUserActivities(String userId, int limit) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        Query query = new Query(Criteria.where("userId").is(userId.trim()))
                .limit(Math.min(limit, 1000));
        return mongoTemplate.find(query, UserActivity.class);
    }
    
    public List<UserActivity> getActivitiesByRole(String userRole, int limit) {
        if (userRole == null || userRole.trim().isEmpty()) {
            throw new IllegalArgumentException("User role cannot be null or empty");
        }
        Query query = new Query(Criteria.where("userRole").is(userRole.trim()))
                .limit(Math.min(limit, 1000));
        return mongoTemplate.find(query, UserActivity.class);
    }
    
    public List<UserActivity> getActivitiesByAction(String action, int limit) {
        if (action == null || action.trim().isEmpty()) {
            throw new IllegalArgumentException("Action cannot be null or empty");
        }
        String sanitizedAction = sanitizeInput(action.trim());
        Query query = new Query(Criteria.where("action").is(sanitizedAction))
                .limit(Math.min(limit, 1000));
        return mongoTemplate.find(query, UserActivity.class);
    }
    
    public List<UserActivity> getAllActivities(int limit) {
        Query query = new Query()
                .limit(limit);
        return mongoTemplate.find(query, UserActivity.class);
    }
    
    public Map<String, Object> getActivityStats() {
        long totalActivities = mongoTemplate.count(new Query(), UserActivity.class);
        
        // Use aggregation for better performance
        long activeUsers = mongoTemplate.getCollection("user_activities")
            .distinct("userId", org.bson.Document.class)
            .into(new java.util.ArrayList<>()).size();
        
        Query todayQuery = new Query(Criteria.where("timestamp").gte(LocalDateTime.now().minusDays(1)));
        long searchesToday = mongoTemplate.count(todayQuery.addCriteria(Criteria.where("action").is("SEARCH")), UserActivity.class);
        long aiInteractions = mongoTemplate.count(new Query(Criteria.where("action").is("AI_SEARCH")), UserActivity.class);
        
        return Map.of(
            "totalActivities", totalActivities,
            "activeUsers", activeUsers,
            "searchesToday", searchesToday,
            "aiInteractions", aiInteractions
        );
    }
    
    public long getActivityCount(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        Query query = new Query(Criteria.where("userId").is(userId.trim()));
        return mongoTemplate.count(query, UserActivity.class);
    }
    
    private String sanitizeInput(String input) {
        if (input == null) return "";
        // Remove potentially dangerous characters
        return input.replaceAll("[<>\"'&${}()\\[\\]]", "");
    }
}
