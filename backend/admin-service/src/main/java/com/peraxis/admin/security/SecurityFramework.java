package com.peraxis.admin.security;

import org.springframework.stereotype.Component;
import org.springframework.data.mongodb.core.query.Criteria;
import java.util.regex.Pattern;
import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class SecurityFramework {
    
    private final SecureRandom secureRandom = new SecureRandom();
    private final ConcurrentHashMap<String, RateLimitInfo> rateLimitMap = new ConcurrentHashMap<>();
    
    public String sanitizeInput(String input) {
        if (input == null) return null;
        
        return input
            .replaceAll("[<>\"'&]", "")
            .replaceAll("javascript:", "")
            .replaceAll("on\\w+\\s*=", "")
            .replaceAll("\\$\\{.*\\}", "")
            .replaceAll("\\$\\(.*\\)", "")
            .trim();
    }
    
    public Criteria createSafeCriteria(String field, String value) {
        String sanitizedValue = sanitizeInput(value);
        return Criteria.where(field).regex(Pattern.quote(sanitizedValue), "i");
    }
    
    public boolean isRateLimited(String identifier, int maxRequests, int windowMinutes) {
        RateLimitInfo info = rateLimitMap.computeIfAbsent(identifier, k -> new RateLimitInfo());
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowStart = now.minus(windowMinutes, ChronoUnit.MINUTES);
        
        if (info.windowStart.isBefore(windowStart)) {
            info.windowStart = now;
            info.requestCount.set(1);
            return false;
        }
        
        return info.requestCount.incrementAndGet() > maxRequests;
    }
    
    public String generateSecureToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
    
    private static class RateLimitInfo {
        LocalDateTime windowStart = LocalDateTime.now();
        AtomicInteger requestCount = new AtomicInteger(0);
    }
}