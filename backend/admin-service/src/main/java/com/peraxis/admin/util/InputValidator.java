package com.peraxis.admin.util;

import java.util.regex.Pattern;

public class InputValidator {
    
    private static final Pattern ALPHANUMERIC_PATTERN = Pattern.compile("^[a-zA-Z0-9\\s._@-]*$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern OBJECT_ID_PATTERN = Pattern.compile("^[a-fA-F0-9]{24}$");
    
    public static String sanitizeSearchInput(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "";
        }
        
        String sanitized = input.trim();
        
        // Remove MongoDB operators and special regex characters
        sanitized = sanitized.replaceAll("[${}\\[\\]().*+?^|\\\\]", "");
        
        // Limit length
        if (sanitized.length() > 100) {
            sanitized = sanitized.substring(0, 100);
        }
        
        return sanitized;
    }
    
    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
    
    public static boolean isValidObjectId(String id) {
        return id != null && OBJECT_ID_PATTERN.matcher(id).matches();
    }
    
    public static boolean isValidAlphanumeric(String input) {
        return input != null && ALPHANUMERIC_PATTERN.matcher(input).matches();
    }
    
    public static String sanitizeUrl(String url) {
        if (url == null) return null;
        
        // Only allow localhost URLs for admin service
        if (url.startsWith("http://localhost:") || url.startsWith("https://localhost:")) {
            return url;
        }
        
        throw new IllegalArgumentException("Invalid URL: Only localhost URLs are allowed");
    }
    
    public static void validateNotNull(Object value, String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException(fieldName + " cannot be null");
        }
    }
    
    public static void validateNotEmpty(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " cannot be empty");
        }
    }
}