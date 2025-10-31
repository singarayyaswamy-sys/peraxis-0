package com.peraxis.notification.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            String type = (String) request.get("type");
            String title = (String) request.get("title");
            
            logNotificationActivity(userId, type, title);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notification sent successfully",
                "notificationId", "NOTIF-" + System.currentTimeMillis()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to send notification"
            ));
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserNotifications(@PathVariable String userId) {
        try {
            List<Map<String, Object>> notifications = List.of(
                Map.of("id", "1", "title", "Order Shipped", "message", "Your order has been shipped", "type", "ORDER_UPDATE", "read", false, "timestamp", System.currentTimeMillis() - 3600000),
                Map.of("id", "2", "title", "Flash Sale Alert", "message", "70% off on electronics", "type", "PROMOTION", "read", false, "timestamp", System.currentTimeMillis() - 7200000)
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", notifications,
                "unreadCount", 2
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to fetch notifications"));
        }
    }
    
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getNotificationStats() {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", Map.of(
                "totalSent", 15420,
                "deliveryRate", 98.5,
                "openRate", 65.2,
                "todaySent", 342
            )
        ));
    }
    
    private void logNotificationActivity(String userId, String type, String title) {
        try {
            Map<String, Object> activity = Map.of(
                "userId", userId,
                "action", "NOTIFICATION_SENT",
                "resource", "notifications",
                "userRole", "SYSTEM",
                "metadata", Map.of("type", type, "title", title)
            );
            
            restTemplate.postForObject("http://localhost:8090/api/activity/log", activity, Map.class);
        } catch (Exception e) {
            // Log silently
        }
    }
}