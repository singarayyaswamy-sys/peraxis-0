package com.peraxis.notification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@SpringBootApplication
@RestController
@RequestMapping("/api/notifications")
public class NotificationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);
    }
    
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "Notification Service is running");
    }
    
    @PostMapping("/email")
    public Map<String, Object> sendEmail(@RequestBody Map<String, Object> emailData) {
        return Map.of(
            "success", true,
            "message", "Email sent successfully",
            "messageId", "MSG-" + System.currentTimeMillis()
        );
    }
    
    @PostMapping("/sms")
    public Map<String, Object> sendSMS(@RequestBody Map<String, Object> smsData) {
        return Map.of(
            "success", true,
            "message", "SMS sent successfully",
            "messageId", "SMS-" + System.currentTimeMillis()
        );
    }
}
