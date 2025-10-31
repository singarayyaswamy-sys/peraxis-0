package com.peraxis.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(unique = true)
    private String phone;
    
    @Column(nullable = false)
    private String password;
    
    private String firstName;
    private String lastName;
    private String profileImage;
    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    @Enumerated(EnumType.STRING)
    private UserStatus status;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
    
    @Column(columnDefinition = "boolean default false")
    private boolean emailVerified = false;
    
    @Column(columnDefinition = "boolean default false")
    private boolean phoneVerified = false;
    
    @Column(columnDefinition = "boolean default false")
    private boolean twoFactorEnabled = false;
    
    private String verificationToken;
    private String resetPasswordToken;
    private LocalDateTime resetPasswordExpiry;
    
    // OAuth fields
    private String googleId;
    private String facebookId;
    private String appleId;
    
    // Seller specific fields
    private String businessName;
    private String businessType;
    private String gstNumber;
    @Column(columnDefinition = "boolean default false")
    private boolean sellerVerified = false;
    private LocalDateTime sellerApprovedAt;
    private String sellerApprovedBy;
    
    public enum UserRole {
        CUSTOMER, SELLER, SUPPORT, ADMIN, SUPER_ADMIN
    }
    
    public enum UserStatus {
        ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    // Password getter removed for security - use authentication service
    public void setPassword(String password) { this.password = password; }
    
    // Internal password access for authentication only
    public String getPasswordHash() { return password; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
    
    public boolean isSellerVerified() { return sellerVerified; }
    public void setSellerVerified(boolean sellerVerified) { this.sellerVerified = sellerVerified; }
    
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
}
