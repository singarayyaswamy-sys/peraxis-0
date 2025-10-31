package com.peraxis.product.service;

import com.peraxis.product.entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductService {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    public Page<Product> getPublicProducts(Pageable pageable, String category, String search) {
        Query query = new Query();
        
        if (category != null && !category.isEmpty()) {
            query.addCriteria(Criteria.where("category").regex(category, "i"));
        }
        
        if (search != null && !search.isEmpty()) {
            query.addCriteria(Criteria.where("name").regex(search, "i"));
        }
        
        query.addCriteria(Criteria.where("status").is("ACTIVE"));
        
        long total = mongoTemplate.count(query, Product.class);
        
        query.with(pageable);
        List<Product> products = mongoTemplate.find(query, Product.class);
        
        return new PageImpl<>(products, pageable, total);
    }
    
    public Product getProductById(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Product ID cannot be null or empty");
        }
        Product product = mongoTemplate.findById(id, Product.class);
        if (product == null) {
            throw new RuntimeException("Product not found with ID: " + id);
        }
        return product;
    }
    
    public List<Product> getFeaturedProducts(int limit) {
        Query query = new Query(Criteria.where("featured").is(true).and("status").is("ACTIVE"));
        query.limit(limit);
        return mongoTemplate.find(query, Product.class);
    }
    
    public List<Product> getTrendingProducts(int limit) {
        Query query = new Query(Criteria.where("trending").is(true).and("status").is("ACTIVE"));
        query.limit(limit);
        return mongoTemplate.find(query, Product.class);
    }
    
    public List<Product> getDeals(int limit) {
        Query query = new Query(Criteria.where("discount").gt(0).and("status").is("ACTIVE"));
        query.limit(limit);
        return mongoTemplate.find(query, Product.class);
    }
    
    public List<String> getAllCategories() {
        return mongoTemplate.findDistinct("category", Product.class, String.class);
    }
    
    public Product createProduct(Product product) {
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        return mongoTemplate.save(product);
    }
    
    public Product updateProduct(String id, Product product, String userId, String userRole) {
        Product existing = mongoTemplate.findById(id, Product.class);
        if (existing != null) {
            if ("SELLER".equals(userRole) && !existing.getSellerId().equals(userId)) {
                throw new RuntimeException("Unauthorized");
            }
            
            product.setId(id);
            product.setUpdatedAt(LocalDateTime.now());
            return mongoTemplate.save(product);
        }
        return null;
    }
    
    public Page<Product> searchProducts(String query, Pageable pageable) {
        Query searchQuery = new Query();
        
        if (query != null && !query.trim().isEmpty()) {
            String sanitizedQuery = sanitizeRegexInput(query.trim());
            searchQuery.addCriteria(new Criteria().orOperator(
                Criteria.where("name").regex(sanitizedQuery, "i"),
                Criteria.where("description").regex(sanitizedQuery, "i"),
                Criteria.where("category").regex(sanitizedQuery, "i")
            ));
        }
        
        searchQuery.addCriteria(Criteria.where("status").is("ACTIVE"));
        
        long total = mongoTemplate.count(searchQuery, Product.class);
        
        searchQuery.with(pageable);
        List<Product> products = mongoTemplate.find(searchQuery, Product.class);
        
        return new PageImpl<>(products, pageable, total);
    }
    
    private String sanitizeRegexInput(String input) {
        if (input == null) return "";
        // Escape regex special characters to prevent ReDoS attacks
        return input.replaceAll("[.*+?^${}()|\\[\\]\\\\]", "\\\\$0");
    }
    
    public void deleteProduct(String id, String userId, String userRole) {
        Product existing = mongoTemplate.findById(id, Product.class);
        if (existing != null) {
            if ("SELLER".equals(userRole) && !existing.getSellerId().equals(userId)) {
                throw new RuntimeException("Unauthorized");
            }
            mongoTemplate.remove(existing);
        }
    }
}
