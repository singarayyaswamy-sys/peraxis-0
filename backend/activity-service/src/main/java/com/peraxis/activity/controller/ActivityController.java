package com.peraxis.activity.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getAdminStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Get real counts from database
            long totalLogs = mongoTemplate.count(new Query(), "system_logs");
            long totalUsers = mongoTemplate.count(new Query(), "users");
            long totalOrders = mongoTemplate.count(new Query(), "orders");
            long totalProducts = mongoTemplate.count(new Query(), "products");
            
            stats.put("totalLogs", totalLogs);
            stats.put("totalUsers", totalUsers);
            stats.put("totalOrders", totalOrders);
            stats.put("totalProducts", totalProducts);
            stats.put("activeConnections", 0); // Will be updated by WebSocket service
            stats.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(Map.of("success", true, "data", stats));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "totalLogs", 0,
                    "totalUsers", 0,
                    "totalOrders", 0,
                    "totalProducts", 0,
                    "activeConnections", 0
                )
            ));
        }
    }
    
    @GetMapping("/health")
    public String health() {
        return "Activity Service is running";
    }
}