package com.peraxis.admin.service;

import com.peraxis.admin.security.SecurityFramework;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AdminUserService {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminUserService.class);
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private SecurityFramework securityFramework;
    
    public void initializeDefaultAdmins() {
        try {
            // Check if admin users exist
            long adminCount = mongoTemplate.count(new Query(), "admin_users");
            
            if (adminCount == 0) {
                createDefaultAdmin("admin@peraxis.com", "ADMIN");
                createDefaultAdmin("superadmin@peraxis.com", "SUPER_ADMIN");
                logger.info("Default admin users created successfully");
            }
        } catch (Exception e) {
            logger.error("Failed to initialize default admin users", e);
        }
    }
    
    private void createDefaultAdmin(String email, String role) {
        String defaultPassword = generateSecurePassword();
        
        Map<String, Object> adminUser = new HashMap<>();
        adminUser.put("id", UUID.randomUUID().toString());
        adminUser.put("email", email);
        adminUser.put("password", passwordEncoder.encode(defaultPassword));
        adminUser.put("role", role);
        adminUser.put("status", "ACTIVE");
        adminUser.put("created_at", LocalDateTime.now());
        adminUser.put("last_login", null);
        adminUser.put("failed_attempts", 0);
        adminUser.put("locked_until", null);
        
        mongoTemplate.save(adminUser, "admin_users");
        
        // Log the default password (only for initial setup)
        logger.warn("SECURITY: Default {} created with email: {} and password: {} - CHANGE IMMEDIATELY!", 
                   role, email, defaultPassword);
    }
    
    public boolean validateAdminCredentials(String email, String password) {
        try {
            // Sanitize input
            email = securityFramework.sanitizeInput(email);
            
            // Rate limiting check
            if (securityFramework.isRateLimited(email, 5, 15)) {
                logger.warn("Rate limit exceeded for admin login attempt: {}", email);
                return false;
            }
            
            Query query = new Query(Criteria.where("email").is(email)
                                          .and("status").is("ACTIVE"));
            Map adminUser = mongoTemplate.findOne(query, Map.class, "admin_users");
            
            if (adminUser == null) {
                logger.warn("Admin login attempt with non-existent email: {}", email);
                return false;
            }
            
            // Check if account is locked
            Object lockedUntil = adminUser.get("locked_until");
            if (lockedUntil != null && LocalDateTime.now().isBefore((LocalDateTime) lockedUntil)) {
                logger.warn("Admin login attempt on locked account: {}", email);
                return false;
            }
            
            String hashedPassword = (String) adminUser.get("password");
            boolean isValid = passwordEncoder.matches(password, hashedPassword);
            
            if (isValid) {
                // Reset failed attempts and update last login
                updateLoginSuccess(email);
                logger.info("Successful admin login: {}", email);
            } else {
                // Increment failed attempts
                updateFailedAttempt(email);
                logger.warn("Failed admin login attempt: {}", email);
            }
            
            return isValid;
            
        } catch (Exception e) {
            logger.error("Error validating admin credentials for: {}", email, e);
            return false;
        }
    }
    
    private void updateLoginSuccess(String email) {
        Query query = new Query(Criteria.where("email").is(email));
        org.springframework.data.mongodb.core.query.Update update = 
            new org.springframework.data.mongodb.core.query.Update()
                .set("last_login", LocalDateTime.now())
                .set("failed_attempts", 0)
                .unset("locked_until");
        
        mongoTemplate.updateFirst(query, update, "admin_users");
    }
    
    private void updateFailedAttempt(String email) {
        Query query = new Query(Criteria.where("email").is(email));
        Map adminUser = mongoTemplate.findOne(query, Map.class, "admin_users");
        
        if (adminUser != null) {
            int failedAttempts = (Integer) adminUser.getOrDefault("failed_attempts", 0) + 1;
            
            org.springframework.data.mongodb.core.query.Update update = 
                new org.springframework.data.mongodb.core.query.Update()
                    .set("failed_attempts", failedAttempts);
            
            // Lock account after 5 failed attempts
            if (failedAttempts >= 5) {
                update.set("locked_until", LocalDateTime.now().plusHours(1));
                logger.warn("Admin account locked due to failed attempts: {}", email);
            }
            
            mongoTemplate.updateFirst(query, update, "admin_users");
        }
    }
    
    public Map<String, Object> getAdminUser(String email) {
        Query query = new Query(Criteria.where("email").is(email));
        Map adminUser = mongoTemplate.findOne(query, Map.class, "admin_users");
        
        if (adminUser != null) {
            // Remove sensitive data
            adminUser.remove("password");
            return adminUser;
        }
        
        return null;
    }
    
    private String generateSecurePassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        StringBuilder password = new StringBuilder();
        java.security.SecureRandom secureRandom = new java.security.SecureRandom();
        
        for (int i = 0; i < 16; i++) {
            password.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        
        return password.toString();
    }
}