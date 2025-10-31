package com.peraxis.admin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SuperAdminLoggingService {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private RestTemplate restTemplate;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public void logSystemActivity(String service, String action, String userId, Map<String, Object> data) {
        try {
            Map<String, Object> log = new HashMap<>();
            log.put("service", service != null ? service : "unknown");
            log.put("action", action != null ? action : "unknown");
            log.put("userId", userId != null ? userId : "anonymous");
            log.put("data", data != null ? data : new HashMap<>());
            log.put("timestamp", System.currentTimeMillis());
            
            mongoTemplate.save(log, "system_logs");
            
            try {
                // Create a Redis-safe copy without complex objects
                Map<String, Object> redisLog = new HashMap<>();
                redisLog.put("service", log.get("service"));
                redisLog.put("action", log.get("action"));
                redisLog.put("userId", log.get("userId"));
                redisLog.put("timestamp", log.get("timestamp"));
                
                redisTemplate.opsForList().leftPush("recent_logs", redisLog);
                redisTemplate.opsForList().trim("recent_logs", 0, 999);
            } catch (Exception redisError) {
                // Silently handle Redis errors to avoid console spam
            }
        } catch (Exception e) {
            System.err.println("System activity logging failed: " + e.getMessage());
            throw e;
        }
    }
    
    public Map<String, Object> getAllSystemLogs(int page, int size) {
        Query query = new Query();
        long total = mongoTemplate.count(query, "system_logs");
        
        query.skip(page * size).limit(size);
        List<Map> logs = mongoTemplate.find(query, Map.class, "system_logs");
        
        return Map.of("logs", logs, "total", total);
    }
    
    public byte[] exportAllData() {
        try {
            Map<String, Object> exportData = new HashMap<>();
            exportData.put("systemLogs", mongoTemplate.findAll(Map.class, "system_logs"));
            exportData.put("userActivities", mongoTemplate.findAll(Map.class, "user_activities"));
            exportData.put("exportTimestamp", LocalDateTime.now());
            
            return objectMapper.writeValueAsBytes(exportData);
        } catch (Exception e) {
            throw new RuntimeException("Export failed: " + e.getMessage());
        }
    }
    
    public Map<String, Object> getRealtimeStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("activeConnections", redisTemplate.opsForHash().size("user:presence"));
        stats.put("recentActivities", mongoTemplate.count(new Query(), "system_logs"));
        return stats;
    }
}