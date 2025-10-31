package com.peraxis.user.aspect;

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
public class LoggingAspect {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @AfterReturning("execution(* com.peraxis.user.controller.*.*(..))")
    public void logActivity(JoinPoint joinPoint) {
        try {
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();
            
            Map<String, Object> logData = new HashMap<>();
            logData.put("service", "user-service");
            logData.put("action", className + "." + methodName);
            logData.put("userId", "system");
            logData.put("data", Map.of("timestamp", System.currentTimeMillis()));
            
            restTemplate.postForObject("http://localhost:8080/api/admin/logs/activity", logData, Map.class);
        } catch (Exception e) {
            System.err.println("Logging failed: " + e.getMessage());
        }
    }
}