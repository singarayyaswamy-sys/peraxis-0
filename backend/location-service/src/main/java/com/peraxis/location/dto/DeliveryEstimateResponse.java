package com.peraxis.location.dto;

public class DeliveryEstimateResponse {
    private Boolean serviceable;
    private Integer deliveryDays;
    private Double deliveryCharge;
    private Boolean freeDelivery;
    private String nearestWarehouse;
    private Double distance;

    public DeliveryEstimateResponse() {}

    public DeliveryEstimateResponse(Boolean serviceable, Integer deliveryDays, Double deliveryCharge, Boolean freeDelivery) {
        this.serviceable = serviceable;
        this.deliveryDays = deliveryDays;
        this.deliveryCharge = deliveryCharge;
        this.freeDelivery = freeDelivery;
    }

    public Boolean getServiceable() { return serviceable; }
    public void setServiceable(Boolean serviceable) { this.serviceable = serviceable; }

    public Integer getDeliveryDays() { return deliveryDays; }
    public void setDeliveryDays(Integer deliveryDays) { this.deliveryDays = deliveryDays; }

    public Double getDeliveryCharge() { return deliveryCharge; }
    public void setDeliveryCharge(Double deliveryCharge) { this.deliveryCharge = deliveryCharge; }

    public Boolean getFreeDelivery() { return freeDelivery; }
    public void setFreeDelivery(Boolean freeDelivery) { this.freeDelivery = freeDelivery; }

    public String getNearestWarehouse() { return nearestWarehouse; }
    public void setNearestWarehouse(String nearestWarehouse) { this.nearestWarehouse = nearestWarehouse; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }
}