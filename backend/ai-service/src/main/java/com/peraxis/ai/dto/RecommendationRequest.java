package com.peraxis.ai.dto;

public class RecommendationRequest {
    private String category;
    private int limit = 10;
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public int getLimit() { return limit; }
    public void setLimit(int limit) { this.limit = limit; }
}
