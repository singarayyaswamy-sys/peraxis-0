package com.peraxis.location.dto;

public class LocationRequest {
    private String address;
    private Double latitude;
    private Double longitude;

    public LocationRequest() {}

    public LocationRequest(String address) {
        this.address = address;
    }

    public LocationRequest(Double latitude, Double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}