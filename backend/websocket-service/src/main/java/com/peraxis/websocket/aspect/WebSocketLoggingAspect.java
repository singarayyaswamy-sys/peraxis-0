package com.peraxis.websocket.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
public class WebSocketLoggingAspect {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @AfterReturning("execution(* com.peraxis.websocket.handler.EnhancedWebSocketHandler.*(..))")
    public void logWebSocketActivity(JoinPoint joinPoint) {
        try {
            String methodName = joinPoint.getSignature().getName();
            
            Map<String, Object> logData = new HashMap<>();
            logData.put("service", "websocket-service");
            logData.put("action", "websocket." + methodName);
            logData.put("userId", "system");
            logData.put("data", Map.of("method", methodName, "timestamp", System.currentTimeMillis()));
            
            restTemplate.postForObject("http://localhost:8080/api/admin/logs/activity", logData, Map.class);
        } catch (Exception e) {
            System.err.println("WebSocket logging failed: " + e.getMessage());
        }
    }
}