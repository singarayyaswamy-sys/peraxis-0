package com.peraxis.admin.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class AdminWebSocketHandler implements WebSocketHandler {
    
    private final Map<String, WebSocketSession> adminSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String adminId = getAdminId(session);
        adminSessions.put(adminId, session);
        
        // Send initial data after a short delay to avoid concurrency issues
        scheduler.schedule(() -> {
            try {
                if (session.isOpen()) {
                    sendInitialData(session);
                }
            } catch (Exception e) {
                // Ignore errors during initial data send
            }
        }, 100, TimeUnit.MILLISECONDS);
        
        startRealTimeUpdates(adminId);
    }
    
    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        String payload = message.getPayload().toString();
        Map<String, Object> command = objectMapper.readValue(payload, Map.class);
        
        switch ((String) command.get("type")) {
            case "GET_STATS":
                sendRealTimeStats(session);
                break;
            case "GET_ACTIVITIES":
                sendRecentActivities(session);
                break;
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        String adminId = getAdminId(session);
        adminSessions.remove(adminId);
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        session.close();
    }
    
    @Override
    public boolean supportsPartialMessages() {
        return false;
    }
    
    private void startRealTimeUpdates(String adminId) {
        scheduler.scheduleAtFixedRate(() -> {
            WebSocketSession session = adminSessions.get(adminId);
            if (session != null && session.isOpen()) {
                try {
                    sendRealTimeStats(session);
                    sendRecentActivities(session);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }, 0, 3, TimeUnit.SECONDS);
    }
    
    private void sendInitialData(WebSocketSession session) throws Exception {
        synchronized (session) {
            if (session.isOpen()) {
                Map<String, Object> initialData = Map.of(
                    "type", "INITIAL_DATA",
                    "stats", getRealTimeStats(),
                    "activities", getRecentActivities()
                );
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(initialData)));
            }
        }
    }
    
    private void sendRealTimeStats(WebSocketSession session) throws Exception {
        synchronized (session) {
            if (session.isOpen()) {
                Map<String, Object> stats = Map.of(
                    "type", "STATS_UPDATE",
                    "data", getRealTimeStats()
                );
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(stats)));
            }
        }
    }
    
    private void sendRecentActivities(WebSocketSession session) throws Exception {
        synchronized (session) {
            if (session.isOpen()) {
                Map<String, Object> activities = Map.of(
                    "type", "ACTIVITIES_UPDATE",
                    "data", getRecentActivities()
                );
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(activities)));
            }
        }
    }
    
    private Map<String, Object> getRealTimeStats() {
        try {
            long totalUsers = mongoTemplate.count(new Query(), "users");
            long totalOrders = mongoTemplate.count(new Query(), "orders");
            long totalProducts = mongoTemplate.count(new Query(), "products");
            long totalRevenue = calculateTotalRevenue();
            long activeConnections = redisTemplate.opsForHash().size("user:presence");
            
            return Map.of(
                "totalUsers", totalUsers,
                "totalOrders", totalOrders,
                "totalProducts", totalProducts,
                "totalRevenue", totalRevenue,
                "activeConnections", activeConnections,
                "timestamp", System.currentTimeMillis()
            );
        } catch (Exception e) {
            return Map.of("error", "Failed to fetch stats");
        }
    }
    
    private Object getRecentActivities() {
        try {
            return mongoTemplate.find(
                new Query()
                    .with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "timestamp"))
                    .limit(50),
                Map.class,
                "system_logs"
            );
        } catch (Exception e) {
            return java.util.Arrays.asList();
        }
    }
    
    private long calculateTotalRevenue() {
        // Implementation to calculate total revenue from orders
        return 0L; // Placeholder
    }
    
    private String getAdminId(WebSocketSession session) {
        return session.getId();
    }
    
    public void broadcastToAllAdmins(Object message) {
        adminSessions.values().forEach(session -> {
            try {
                synchronized (session) {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
                    }
                }
            } catch (Exception e) {
                // Remove failed session
                adminSessions.values().remove(session);
            }
        });
    }
}