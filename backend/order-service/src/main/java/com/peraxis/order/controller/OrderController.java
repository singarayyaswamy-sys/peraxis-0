package com.peraxis.order.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
// @CrossOrigin - Handled by Gateway
public class OrderController {
    
    @GetMapping("/health")
    public String health() {
        return "Order Service is running";
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserOrders(@PathVariable String userId) {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", List.of(
                Map.of("id", "ORD-001", "total", 1299.99, "status", "DELIVERED", "date", "2024-01-15"),
                Map.of("id", "ORD-002", "total", 699.99, "status", "SHIPPED", "date", "2024-01-20")
            )
        ));
    }
    
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderData) {
        try {
            // Validate input
            if (orderData == null || orderData.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Order data is required"
                ));
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "orderId", "ORD-" + System.currentTimeMillis(),
                "message", "Order created successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Failed to create order"
            ));
        }
    }
    
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", List.of(
                Map.of("id", "ORD-001", "customer", "John Doe", "total", 1299.99, "status", "DELIVERED"),
                Map.of("id", "ORD-002", "customer", "Jane Smith", "total", 699.99, "status", "SHIPPED"),
                Map.of("id", "ORD-003", "customer", "Bob Wilson", "total", 299.99, "status", "PENDING")
            )
        ));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getOrderStats() {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "total", 8230,
            "growth", "+12%",
            "pending", 45,
            "shipped", 120,
            "delivered", 8065
        ));
    }
}