package com.peraxis.websocket.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.regex.Pattern;

@Service
public class RealtimeEventService {
    
    private static final Logger logger = LoggerFactory.getLogger(RealtimeEventService.class);
    private static final Pattern SAFE_STRING_PATTERN = Pattern.compile("^[a-zA-Z0-9\\s\\-_@.]+$");
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private ChannelTopic realtimeTopic;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Sanitize input to prevent log injection
    private String sanitizeForLogging(String input) {
        if (input == null) return "null";
        return input.replaceAll("[\\r\\n\\t]", "_")
                   .replaceAll("[^\\p{Print}]", "")
                   .substring(0, Math.min(input.length(), 100));
    }
    
    // Validate string input
    private boolean isValidInput(String input) {
        return input != null && input.length() <= 255 && SAFE_STRING_PATTERN.matcher(input).matches();
    }
    
    public void publishOrderUpdate(String orderId, String status, String userId) {
        // Validate inputs
        if (!isValidInput(orderId) || !isValidInput(status) || !isValidInput(userId)) {
            logger.warn("Invalid input parameters for order update");
            return;
        }
        
        try {
            Map<String, Object> event = Map.of(
                "type", "order-update",
                "orderId", orderId,
                "status", status,
                "userId", userId,
                "timestamp", System.currentTimeMillis()
            );
            
            String message = objectMapper.writeValueAsString(event);
            redisTemplate.convertAndSend(realtimeTopic.getTopic(), message);
        } catch (Exception e) {
            logger.error("Error publishing order update for orderId: {}, status: {}", 
                sanitizeForLogging(orderId), sanitizeForLogging(status), e);
        }
    }
    
    public void publishPriceUpdate(String productId, Double price, Double originalPrice) {
        // Validate inputs
        if (!isValidInput(productId) || price == null || price < 0) {
            logger.warn("Invalid input parameters for price update");
            return;
        }
        
        try {
            Map<String, Object> event = Map.of(
                "type", "price-update",
                "productId", productId,
                "price", price,
                "originalPrice", originalPrice != null ? originalPrice : 0.0,
                "discount", calculateDiscount(price, originalPrice),
                "timestamp", System.currentTimeMillis()
            );
            
            String message = objectMapper.writeValueAsString(event);
            redisTemplate.convertAndSend(realtimeTopic.getTopic(), message);
        } catch (Exception e) {
            logger.error("Error publishing price update for productId: {}, price: {}", 
                sanitizeForLogging(productId), price, e);
        }
    }
    
    public void publishInventoryUpdate(String productId, Integer stock, String status) {
        // Validate inputs
        if (!isValidInput(productId) || !isValidInput(status) || stock == null || stock < 0) {
            logger.warn("Invalid input parameters for inventory update");
            return;
        }
        
        try {
            Map<String, Object> event = Map.of(
                "type", "inventory-update",
                "productId", productId,
                "stock", stock,
                "status", status,
                "timestamp", System.currentTimeMillis()
            );
            
            String message = objectMapper.writeValueAsString(event);
            redisTemplate.convertAndSend(realtimeTopic.getTopic(), message);
        } catch (Exception e) {
            logger.error("Error publishing inventory update for productId: {}, stock: {}", 
                sanitizeForLogging(productId), stock, e);
        }
    }
    
    public void publishNotification(String userId, String title, String message, String type) {
        // Validate inputs
        if (!isValidInput(userId) || !isValidInput(type)) {
            logger.warn("Invalid input parameters for notification");
            return;
        }
        
        // Sanitize message content
        String sanitizedTitle = title != null ? title.substring(0, Math.min(title.length(), 100)) : "";
        String sanitizedMessage = message != null ? message.substring(0, Math.min(message.length(), 500)) : "";
        
        try {
            Map<String, Object> event = Map.of(
                "type", "notification",
                "userId", userId,
                "title", sanitizedTitle,
                "message", sanitizedMessage,
                "notificationType", type,
                "timestamp", System.currentTimeMillis()
            );
            
            String eventMessage = objectMapper.writeValueAsString(event);
            redisTemplate.convertAndSend(realtimeTopic.getTopic(), eventMessage);
        } catch (Exception e) {
            logger.error("Error publishing notification for userId: {}, type: {}", 
                sanitizeForLogging(userId), sanitizeForLogging(type), e);
        }
    }
    
    private double calculateDiscount(Double currentPrice, Double originalPrice) {
        if (originalPrice == null || originalPrice == 0) return 0;
        return ((originalPrice - currentPrice) / originalPrice) * 100;
    }
}