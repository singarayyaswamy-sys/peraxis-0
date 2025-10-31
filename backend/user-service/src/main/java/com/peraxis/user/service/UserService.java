package com.peraxis.user.service;

import com.peraxis.user.entity.User;
import com.peraxis.user.dto.LoginRequest;
import com.peraxis.user.dto.RegisterRequest;
import com.peraxis.user.dto.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class UserService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    private RowMapper<User> userRowMapper = new RowMapper<User>() {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException {
            User user = new User();
            user.setId(rs.getLong("id"));
            user.setEmail(rs.getString("email"));
            user.setPassword(rs.getString("password")); // For internal authentication
            user.setFirstName(rs.getString("first_name"));
            user.setLastName(rs.getString("last_name"));
            user.setRole(User.UserRole.valueOf(rs.getString("role")));
            user.setStatus(User.UserStatus.valueOf(rs.getString("status")));
            user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return user;
        }
    };
    
    public User createUser(User user) {
        if (user == null || user.getEmail() == null || user.getPasswordHash() == null) {
            throw new IllegalArgumentException("User data cannot be null");
        }
        
        try {
            String hashedPassword = passwordEncoder.encode(user.getPasswordHash());
            user.setPassword(hashedPassword);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            
            String sql = "INSERT INTO users (email, password, first_name, last_name, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            
            jdbcTemplate.update(sql, 
                user.getEmail(), 
                hashedPassword, 
                user.getFirstName(), 
                user.getLastName(), 
                user.getRole().name(), 
                user.getStatus().name(),
                user.getCreatedAt(),
                user.getUpdatedAt()
            );
            
            return findByEmail(user.getEmail());
        } catch (Exception e) {
            throw new RuntimeException("Failed to create user: " + e.getMessage(), e);
        }
    }
    
    public User findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        List<User> users = jdbcTemplate.query(sql, userRowMapper, email);
        return users.isEmpty() ? null : users.get(0);
    }
    
    public User findByUsername(String username) {
        String sql = "SELECT * FROM users WHERE username = ?";
        List<User> users = jdbcTemplate.query(sql, userRowMapper, username);
        return users.isEmpty() ? null : users.get(0);
    }
    
    public User findByUsernameOrEmail(String usernameOrEmail) {
        // First try to find by email
        User user = findByEmail(usernameOrEmail);
        if (user != null) {
            return user;
        }
        // If not found by email, try by username
        return findByUsername(usernameOrEmail);
    }
    
    public User findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        List<User> users = jdbcTemplate.query(sql, userRowMapper, id);
        return users.isEmpty() ? null : users.get(0);
    }
    
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
    
    public List<User> getAllUsers() {
        String sql = "SELECT * FROM users ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, userRowMapper);
    }
    
    public UserResponse register(RegisterRequest request) {
        // Check if email already exists
        if (findByEmail(request.getEmail()) != null) {
            throw new RuntimeException("Email already registered");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(User.UserRole.CUSTOMER);
        user.setStatus(User.UserStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        String sql = "INSERT INTO users (username, email, password, first_name, last_name, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try {
            String hashedPassword = passwordEncoder.encode(request.getPassword());
            
            jdbcTemplate.update(sql, 
                user.getUsername(),
                user.getEmail(), 
                hashedPassword, 
                user.getFirstName(), 
                user.getLastName(), 
                user.getRole().name(), 
                user.getStatus().name(),
                user.getCreatedAt(),
                user.getUpdatedAt()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to create user: " + e.getMessage());
        }
        
        User savedUser = findByEmail(user.getEmail());
        return new UserResponse(savedUser);
    }
    
    public Map<String, Object> login(LoginRequest request) {
        // Find user by email or username
        User user = findByUsernameOrEmail(request.getUsernameOrEmail());
        
        // If user doesn't exist, return error
        if (user == null) {
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", false);
            response.put("message", "User not found. Please register first.");
            return response;
        }
        
        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid password");
            return response;
        }
        
        // Check if user account is active
        if (user.getStatus() != User.UserStatus.ACTIVE) {
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", false);
            response.put("message", "Account is not active. Please contact support.");
            return response;
        }
        
        // Successful login
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Login successful");
        response.put("user", new UserResponse(user));
        response.put("token", generateToken(user)); // Add JWT token
        return response;
    }
    
    private String generateToken(User user) {
        // Simple token for development - in production use proper JWT
        return "token_" + user.getId() + "_" + System.currentTimeMillis();
    }
    
    public UserResponse getUserById(long id) {
        User user = findById(id);
        return user != null ? new UserResponse(user) : null;
    }
    
    public UserResponse updateUser(long id, Map<String, Object> updates) {
        User user = findById(id);
        if (user != null) {
            if (updates.containsKey("firstName")) {
                user.setFirstName((String) updates.get("firstName"));
            }
            if (updates.containsKey("lastName")) {
                user.setLastName((String) updates.get("lastName"));
            }
            user.setUpdatedAt(LocalDateTime.now());
            
            String sql = "UPDATE users SET first_name = ?, last_name = ?, updated_at = ? WHERE id = ?";
            jdbcTemplate.update(sql, user.getFirstName(), user.getLastName(), user.getUpdatedAt(), user.getId());
            
            return new UserResponse(user);
        }
        return null;
    }
    
    public User updateUser(User user) {
        user.setUpdatedAt(LocalDateTime.now());
        
        String sql = "UPDATE users SET first_name = ?, last_name = ?, role = ?, status = ?, updated_at = ? WHERE id = ?";
        
        jdbcTemplate.update(sql,
            user.getFirstName(),
            user.getLastName(),
            user.getRole().name(),
            user.getStatus().name(),
            user.getUpdatedAt(),
            user.getId()
        );
        
        return findById(user.getId());
    }
    
    /**
     * Verifies email using token - placeholder implementation
     * TODO: Implement actual email verification with token validation
     */
    public boolean verifyEmail(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }
        // TODO: Implement actual token validation logic
        return true;
    }
    
    /**
     * Verifies phone using SMS code - placeholder implementation
     * TODO: Implement actual SMS verification with code validation
     */
    public boolean verifyPhone(String phone, String code) {
        if (phone == null || code == null || phone.trim().isEmpty() || code.trim().isEmpty()) {
            return false;
        }
        // TODO: Implement actual SMS verification logic
        return true;
    }
    
    public long getTotalUsers() {
        String sql = "SELECT COUNT(*) FROM users";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }
    
    public void updateUserStatus(Long id, String status) {
        if (id == null || status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid parameters");
        }
        
        // Validate status enum
        try {
            User.UserStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value");
        }
        
        String sql = "UPDATE users SET status = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql, status, LocalDateTime.now(), id);
    }
}
