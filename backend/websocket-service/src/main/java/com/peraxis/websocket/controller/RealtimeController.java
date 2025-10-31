package com.peraxis.websocket.controller;

import com.peraxis.websocket.service.RealtimeEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/realtime")
public class RealtimeController {

    @Autowired
    private RealtimeEventService eventService;

    @PostMapping("/inventory")
    public ResponseEntity<?> updateInventory(@RequestBody Map<String, Object> data) {
        try {
            String productId = sanitizeInput(String.valueOf(data.get("productId")));
            Integer stock = Integer.valueOf(String.valueOf(data.get("stock")));
            String status = sanitizeInput(String.valueOf(data.get("status")));
            
            eventService.publishInventoryUpdate(productId, stock, status);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/price")
    public ResponseEntity<?> updatePrice(@RequestBody Map<String, Object> data) {
        try {
            String productId = sanitizeInput(String.valueOf(data.get("productId")));
            Double price = Double.valueOf(String.valueOf(data.get("price")));
            Double originalPrice = Double.valueOf(String.valueOf(data.getOrDefault("originalPrice", price)));
            
            eventService.publishPriceUpdate(productId, price, originalPrice);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/order")
    public ResponseEntity<?> orderUpdate(@RequestBody Map<String, Object> data) {
        try {
            String orderId = sanitizeInput(String.valueOf(data.get("orderId")));
            String status = sanitizeInput(String.valueOf(data.get("status")));
            String userId = sanitizeInput(String.valueOf(data.get("userId")));
            
            eventService.publishOrderUpdate(orderId, status, userId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/notification")
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, Object> data) {
        try {
            String userId = sanitizeInput(String.valueOf(data.get("userId")));
            String title = sanitizeInput(String.valueOf(data.get("title")));
            String message = sanitizeInput(String.valueOf(data.get("message")));
            String type = sanitizeInput(String.valueOf(data.getOrDefault("type", "info")));
            
            eventService.publishNotification(userId, title, message, type);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    private String sanitizeInput(String input) {
        if (input == null) return "";
        return input.replaceAll("[<>\"'&]", "");
    }
}