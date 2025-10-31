package com.peraxis.user.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    private String usernameOrEmail;
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    public String getUsernameOrEmail() { 
        return usernameOrEmail != null ? usernameOrEmail : email; 
    }
    public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
