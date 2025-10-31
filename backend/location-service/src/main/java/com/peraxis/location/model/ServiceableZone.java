package com.peraxis.location.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "serviceable_zones")
public class ServiceableZone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String pincode;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private Boolean serviceable = true;

    @Column(name = "delivery_days")
    private Integer deliveryDays = 3;

    @Column(name = "free_delivery_threshold")
    private Double freeDeliveryThreshold = 500.0;

    @Column(name = "delivery_charge")
    private Double deliveryCharge = 50.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Constructors
    public ServiceableZone() {}

    public ServiceableZone(String pincode, String city, String state) {
        this.pincode = pincode;
        this.city = city;
        this.state = state;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public Boolean getServiceable() { return serviceable; }
    public void setServiceable(Boolean serviceable) { this.serviceable = serviceable; }

    public Integer getDeliveryDays() { return deliveryDays; }
    public void setDeliveryDays(Integer deliveryDays) { this.deliveryDays = deliveryDays; }

    public Double getFreeDeliveryThreshold() { return freeDeliveryThreshold; }
    public void setFreeDeliveryThreshold(Double freeDeliveryThreshold) { this.freeDeliveryThreshold = freeDeliveryThreshold; }

    public Double getDeliveryCharge() { return deliveryCharge; }
    public void setDeliveryCharge(Double deliveryCharge) { this.deliveryCharge = deliveryCharge; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}