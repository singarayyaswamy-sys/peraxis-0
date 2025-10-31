package com.peraxis.payment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@SpringBootApplication
@RestController
@RequestMapping("/api/payments")
public class PaymentServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PaymentServiceApplication.class, args);
    }
    
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "Payment Service is running");
    }
    
    @PostMapping("/process")
    public Map<String, Object> processPayment(@RequestBody Map<String, Object> paymentData) {
        try {
            // Validate required fields
            if (paymentData == null) {
                throw new IllegalArgumentException("Payment data is required");
            }
            
            Object amount = paymentData.get("amount");
            String currency = (String) paymentData.get("currency");
            String paymentMethod = (String) paymentData.get("paymentMethod");
            
            if (amount == null || currency == null || paymentMethod == null) {
                throw new IllegalArgumentException("Missing required fields: amount, currency, paymentMethod");
            }
            
            // Validate amount
            double amountValue = Double.parseDouble(amount.toString());
            if (amountValue <= 0) {
                throw new IllegalArgumentException("Amount must be greater than 0");
            }
            
            return Map.of(
                "success", true,
                "transactionId", "TXN-" + System.currentTimeMillis(),
                "status", "COMPLETED",
                "amount", amountValue,
                "currency", currency
            );
        } catch (Exception e) {
            return Map.of(
                "success", false,
                "error", e.getMessage()
            );
        }
    }
}
