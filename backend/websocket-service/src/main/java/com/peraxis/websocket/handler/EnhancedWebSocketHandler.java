package com.peraxis.websocket.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class EnhancedWebSocketHandler implements WebSocketHandler {
    
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, String> userSessions = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> roomMembers = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(5);
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final ChannelTopic realtimeTopic;
    private final RestTemplate restTemplate;
    
    public EnhancedWebSocketHandler(RedisTemplate<String, Object> redisTemplate, 
                                   ChannelTopic realtimeTopic, 
                                   RestTemplate restTemplate) {
        this.redisTemplate = redisTemplate;
        this.realtimeTopic = realtimeTopic;
        this.restTemplate = restTemplate;
    }
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
        
        // Extract user info from session attributes or headers
        String userId = extractUserId(session);
        if (userId != null) {
            userSessions.put(userId, session.getId());
            
            // Store user presence in Redis
            redisTemplate.opsForHash().put("user:presence", userId, LocalDateTime.now().toString());
            
            // Join default room
            joinRoom(session.getId(), "general");
        }
        
        System.out.println("WebSocket connection established: " + session.getId());
        
        // Send connection confirmation with capabilities
        sendMessage(session, Map.of(
            "type", "connection",
            "status", "connected",
            "sessionId", session.getId(),
            "features", Arrays.asList("ai-chat", "real-time-updates", "voice-notes", "file-sharing", "presence"),
            "timestamp", System.currentTimeMillis()
        ));
        
        // Start heartbeat
        startHeartbeat(session);
    }
    
    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        try {
            String payload = message.getPayload().toString();
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);
            
            String type = (String) data.get("type");
            String userId = extractUserId(session);
            
            // Log activity to activity service
            logActivity(userId, type, data);
            
            switch (type) {
                case "ai-chat":
                    handleAIChat(session, data);
                    break;
                case "chat":
                    handleChat(session, data);
                    break;
                case "typing":
                    handleTyping(session, data);
                    break;
                case "join-room":
                    handleJoinRoom(session, data);
                    break;
                case "leave-room":
                    handleLeaveRoom(session, data);
                    break;
                case "voice-note":
                    handleVoiceNote(session, data);
                    break;
                case "file-share":
                    handleFileShare(session, data);
                    break;
                case "product-view":
                    handleProductView(session, data);
                    break;
                case "cart-update":
                    handleCartUpdate(session, data);
                    break;
                case "order-tracking":
                    handleOrderTracking(session, data);
                    break;
                case "presence":
                    handlePresence(session, data);
                    break;
                case "heartbeat":
                    handleHeartbeat(session);
                    break;
                default:
                    System.out.println("Unknown message type: " + type);
            }
        } catch (Exception e) {
            System.err.println("Error handling message: " + e.getMessage());
            sendError(session, "Message processing failed");
        }
    }
    
    private void handleAIChat(WebSocketSession session, Map<String, Object> data) {
        String message = sanitizeInput(String.valueOf(data.get("message")));
        String userId = extractUserId(session);
        
        // Send to AI service asynchronously
        scheduler.submit(() -> {
            try {
                Map<String, Object> aiRequest = Map.of(
                    "message", message,
                    "userId", userId,
                    "context", "product-search"
                );
                
                Map<String, Object> aiResponse = restTemplate.postForObject(
                    "http://localhost:8084/api/ai/chat", aiRequest, Map.class);
                
                if (aiResponse != null && (Boolean) aiResponse.get("success")) {
                    sendMessage(session, Map.of(
                        "type", "ai-response",
                        "message", aiResponse.get("response"),
                        "suggestions", aiResponse.getOrDefault("suggestions", Arrays.asList()),
                        "products", aiResponse.getOrDefault("products", Arrays.asList()),
                        "timestamp", System.currentTimeMillis()
                    ));
                }
            } catch (Exception e) {
                sendMessage(session, Map.of(
                    "type", "ai-response",
                    "message", "I'm having trouble processing your request. Please try again.",
                    "timestamp", System.currentTimeMillis()
                ));
            }
        });
    }
    
    private void handleChat(WebSocketSession session, Map<String, Object> data) {
        String message = sanitizeInput(String.valueOf(data.get("message")));
        String room = sanitizeInput(String.valueOf(data.getOrDefault("room", "general")));
        String userId = extractUserId(session);
        
        Map<String, Object> chatMessage = Map.of(
            "type", "chat",
            "message", message,
            "userId", userId,
            "room", room,
            "timestamp", System.currentTimeMillis()
        );
        
        // Broadcast to room members
        broadcastToRoom(room, chatMessage);
        
        // Store in Redis for chat history
        redisTemplate.opsForList().leftPush("chat:" + room, chatMessage);
        redisTemplate.expire("chat:" + room, 24, TimeUnit.HOURS);
    }
    
    private void handleTyping(WebSocketSession session, Map<String, Object> data) {
        String room = sanitizeInput(String.valueOf(data.getOrDefault("room", "general")));
        String userId = extractUserId(session);
        boolean isTyping = Boolean.parseBoolean(String.valueOf(data.get("typing")));
        
        Map<String, Object> typingMessage = Map.of(
            "type", "typing",
            "userId", userId,
            "room", room,
            "typing", isTyping,
            "timestamp", System.currentTimeMillis()
        );
        
        broadcastToRoom(room, typingMessage, session.getId());
    }
    
    private void handleProductView(WebSocketSession session, Map<String, Object> data) {
        String productId = sanitizeInput(String.valueOf(data.get("productId")));
        String userId = extractUserId(session);
        
        // Real-time product analytics
        redisTemplate.opsForHash().increment("product:views", productId, 1);
        redisTemplate.opsForHash().increment("product:views:today", productId, 1);
        
        // Broadcast real-time view count
        Long viewCount = (Long) redisTemplate.opsForHash().get("product:views", productId);
        
        Map<String, Object> viewUpdate = Map.of(
            "type", "product-views",
            "productId", productId,
            "viewCount", viewCount,
            "timestamp", System.currentTimeMillis()
        );
        
        broadcastToRoom("product:" + productId, viewUpdate);
        
        // AI-powered recommendations
        scheduler.submit(() -> generateRecommendations(session, userId, productId));
    }
    
    private void handleCartUpdate(WebSocketSession session, Map<String, Object> data) {
        String userId = extractUserId(session);
        
        // Sync cart across devices
        Map<String, Object> cartSync = Map.of(
            "type", "cart-sync",
            "cart", data.get("cart"),
            "timestamp", System.currentTimeMillis()
        );
        
        // Send to all user sessions
        broadcastToUser(userId, cartSync);
        
        // Store in Redis
        redisTemplate.opsForValue().set("cart:" + userId, data.get("cart"), 24, TimeUnit.HOURS);
    }
    
    private void handleOrderTracking(WebSocketSession session, Map<String, Object> data) {
        String orderId = sanitizeInput(String.valueOf(data.get("orderId")));
        String userId = extractUserId(session);
        
        // Subscribe to order updates
        joinRoom(session.getId(), "order:" + orderId);
        
        // Send current order status
        scheduler.submit(() -> {
            try {
                Map<String, Object> orderStatus = restTemplate.getForObject(
                    "http://localhost:8083/api/orders/" + orderId + "/status", Map.class);
                
                if (orderStatus != null) {
                    sendMessage(session, Map.of(
                        "type", "order-status",
                        "orderId", orderId,
                        "status", orderStatus,
                        "timestamp", System.currentTimeMillis()
                    ));
                }
            } catch (Exception e) {
                System.err.println("Error fetching order status: " + e.getMessage());
            }
        });
    }
    
    private void handlePresence(WebSocketSession session, Map<String, Object> data) {
        String userId = extractUserId(session);
        String status = sanitizeInput(String.valueOf(data.get("status")));
        
        // Update presence in Redis
        redisTemplate.opsForHash().put("user:presence", userId, Map.of(
            "status", status,
            "lastSeen", LocalDateTime.now().toString()
        ));
        
        // Broadcast presence update
        Map<String, Object> presenceUpdate = Map.of(
            "type", "presence-update",
            "userId", userId,
            "status", status,
            "timestamp", System.currentTimeMillis()
        );
        
        broadcastMessage(presenceUpdate);
    }
    
    private void generateRecommendations(WebSocketSession session, String userId, String productId) {
        try {
            Map<String, Object> recommendations = restTemplate.getForObject(
                "http://localhost:8084/api/ai/recommendations?userId=" + userId + "&productId=" + productId,
                Map.class);
            
            if (recommendations != null && (Boolean) recommendations.get("success")) {
                sendMessage(session, Map.of(
                    "type", "ai-recommendations",
                    "products", recommendations.get("products"),
                    "reason", recommendations.get("reason"),
                    "timestamp", System.currentTimeMillis()
                ));
            }
        } catch (Exception e) {
            System.err.println("Error generating recommendations: " + e.getMessage());
        }
    }
    
    private void logActivity(String userId, String action, Map<String, Object> data) {
        scheduler.submit(() -> {
            try {
                Map<String, Object> activity = Map.of(
                    "userId", userId,
                    "action", action,
                    "data", data,
                    "timestamp", LocalDateTime.now().toString()
                );
                
                restTemplate.postForObject("http://localhost:8090/api/activity/log", activity, Map.class);
            } catch (Exception e) {
                System.err.println("Error logging activity: " + e.getMessage());
            }
        });
    }
    
    private void startHeartbeat(WebSocketSession session) {
        scheduler.scheduleAtFixedRate(() -> {
            if (session.isOpen()) {
                sendMessage(session, Map.of("type", "ping", "timestamp", System.currentTimeMillis()));
            }
        }, 30, 30, TimeUnit.SECONDS);
    }
    
    private void handleHeartbeat(WebSocketSession session) {
        sendMessage(session, Map.of("type", "pong", "timestamp", System.currentTimeMillis()));
    }
    
    public void handleRedisMessage(String message) {
        try {
            Map<String, Object> data = objectMapper.readValue(message, Map.class);
            String type = (String) data.get("type");
            
            switch (type) {
                case "order-update":
                    broadcastOrderUpdate(data);
                    break;
                case "price-update":
                    broadcastPriceUpdate(data);
                    break;
                case "inventory-update":
                    broadcastInventoryUpdate(data);
                    break;
                case "notification":
                    broadcastNotification(data);
                    break;
            }
        } catch (Exception e) {
            System.err.println("Error handling Redis message: " + e.getMessage());
        }
    }
    
    private void broadcastOrderUpdate(Map<String, Object> data) {
        String orderId = (String) data.get("orderId");
        broadcastToRoom("order:" + orderId, data);
    }
    
    private void broadcastPriceUpdate(Map<String, Object> data) {
        String productId = (String) data.get("productId");
        broadcastToRoom("product:" + productId, data);
    }
    
    private void broadcastInventoryUpdate(Map<String, Object> data) {
        String productId = (String) data.get("productId");
        broadcastToRoom("product:" + productId, data);
    }
    
    private void broadcastNotification(Map<String, Object> data) {
        String userId = (String) data.get("userId");
        if (userId != null) {
            broadcastToUser(userId, data);
        } else {
            broadcastMessage(data);
        }
    }
    
    private void joinRoom(String sessionId, String room) {
        roomMembers.computeIfAbsent(room, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
    }
    
    private void leaveRoom(String sessionId, String room) {
        Set<String> members = roomMembers.get(room);
        if (members != null) {
            members.remove(sessionId);
            if (members.isEmpty()) {
                roomMembers.remove(room);
            }
        }
    }
    
    private void handleJoinRoom(WebSocketSession session, Map<String, Object> data) {
        String room = sanitizeInput(String.valueOf(data.get("room")));
        joinRoom(session.getId(), room);
        
        sendMessage(session, Map.of(
            "type", "room-joined",
            "room", room,
            "timestamp", System.currentTimeMillis()
        ));
    }
    
    private void handleLeaveRoom(WebSocketSession session, Map<String, Object> data) {
        String room = sanitizeInput(String.valueOf(data.get("room")));
        leaveRoom(session.getId(), room);
        
        sendMessage(session, Map.of(
            "type", "room-left",
            "room", room,
            "timestamp", System.currentTimeMillis()
        ));
    }
    
    private void handleVoiceNote(WebSocketSession session, Map<String, Object> data) {
        String room = sanitizeInput(String.valueOf(data.getOrDefault("room", "general")));
        String userId = extractUserId(session);
        
        Map<String, Object> voiceMessage = Map.of(
            "type", "voice-note",
            "userId", userId,
            "room", room,
            "audioData", data.get("audioData"),
            "duration", data.get("duration"),
            "timestamp", System.currentTimeMillis()
        );
        
        broadcastToRoom(room, voiceMessage);
    }
    
    private void handleFileShare(WebSocketSession session, Map<String, Object> data) {
        String room = sanitizeInput(String.valueOf(data.getOrDefault("room", "general")));
        String userId = extractUserId(session);
        
        Map<String, Object> fileMessage = Map.of(
            "type", "file-share",
            "userId", userId,
            "room", room,
            "fileName", sanitizeInput(String.valueOf(data.get("fileName"))),
            "fileUrl", sanitizeInput(String.valueOf(data.get("fileUrl"))),
            "fileSize", data.get("fileSize"),
            "timestamp", System.currentTimeMillis()
        );
        
        broadcastToRoom(room, fileMessage);
    }
    
    private void broadcastToRoom(String room, Object message) {
        broadcastToRoom(room, message, null);
    }
    
    private void broadcastToRoom(String room, Object message, String excludeSessionId) {
        Set<String> members = roomMembers.get(room);
        if (members != null) {
            members.forEach(sessionId -> {
                if (!sessionId.equals(excludeSessionId)) {
                    WebSocketSession session = sessions.get(sessionId);
                    if (session != null) {
                        sendMessage(session, message);
                    }
                }
            });
        }
    }
    
    private void broadcastToUser(String userId, Object message) {
        String sessionId = userSessions.get(userId);
        if (sessionId != null) {
            WebSocketSession session = sessions.get(sessionId);
            if (session != null) {
                sendMessage(session, message);
            }
        }
    }
    
    private void broadcastMessage(Object message) {
        sessions.values().forEach(session -> sendMessage(session, message));
    }
    
    private void sendMessage(WebSocketSession session, Object message) {
        try {
            if (session.isOpen()) {
                String json = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(json));
            }
        } catch (IOException e) {
            System.err.println("Error sending message: " + e.getMessage());
        }
    }
    
    private void sendError(WebSocketSession session, String error) {
        sendMessage(session, Map.of(
            "type", "error",
            "message", error,
            "timestamp", System.currentTimeMillis()
        ));
    }
    
    private String extractUserId(WebSocketSession session) {
        // Extract from query params or headers
        String query = session.getUri().getQuery();
        if (query != null && query.contains("userId=")) {
            return query.split("userId=")[1].split("&")[0];
        }
        return "anonymous_" + session.getId();
    }
    
    private String sanitizeInput(String input) {
        if (input == null) return "";
        return input.replaceAll("[<>\"'&]", "");
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.err.println("WebSocket transport error for session " + session.getId() + ": " + exception.getMessage());
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        String userId = extractUserId(session);
        
        sessions.remove(session.getId());
        userSessions.remove(userId);
        
        // Remove from all rooms
        roomMembers.values().forEach(members -> members.remove(session.getId()));
        
        // Update presence
        redisTemplate.opsForHash().put("user:presence", userId, Map.of(
            "status", "offline",
            "lastSeen", LocalDateTime.now().toString()
        ));
        
        System.out.println("WebSocket connection closed: " + session.getId());
    }
    
    @Override
    public boolean supportsPartialMessages() {
        return false;
    }
}