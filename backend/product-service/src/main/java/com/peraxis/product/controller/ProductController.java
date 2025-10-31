package com.peraxis.product.controller;

import com.peraxis.product.entity.Product;
import com.peraxis.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
// @CrossOrigin - Handled by Gateway
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @GetMapping
    public ResponseEntity<?> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String minPrice,
            @RequestParam(required = false) String maxPrice,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String rating,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String search) {
        
        Page<Product> products = productService.getPublicProducts(
            PageRequest.of(page, size), category, search);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "products", products.getContent(),
            "totalPages", products.getTotalPages(),
            "totalElements", products.getTotalElements()
        ));
    }
    
    @GetMapping("/public")
    public ResponseEntity<?> getPublicProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        
        Page<Product> products = productService.getPublicProducts(
            PageRequest.of(page, size), category, search);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "products", products.getContent(),
            "totalPages", products.getTotalPages(),
            "totalElements", products.getTotalElements()
        ));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getProduct(@PathVariable String id) {
        try {
            Product product = productService.getProductById(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "product", product
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedProducts(@RequestParam(defaultValue = "10") int limit) {
        List<Product> products = productService.getFeaturedProducts(limit);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", products
        ));
    }
    
    @GetMapping("/trending")
    public ResponseEntity<?> getTrendingProducts(@RequestParam(defaultValue = "10") int limit) {
        List<Product> products = productService.getTrendingProducts(limit);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", products
        ));
    }
    
    @GetMapping("/deals")
    public ResponseEntity<?> getDeals(@RequestParam(defaultValue = "10") int limit) {
        List<Product> products = productService.getDeals(limit);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", products
        ));
    }
    
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        List<String> categories = productService.getAllCategories();
        List<Map<String, String>> categoryObjects = categories.stream()
            .map(cat -> Map.of("id", cat.toLowerCase(), "name", cat))
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", categoryObjects
        ));
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<Product> products = productService.searchProducts(query, PageRequest.of(page, size));
        return ResponseEntity.ok(Map.of(
            "success", true,
            "products", products.getContent(),
            "totalPages", products.getTotalPages(),
            "totalElements", products.getTotalElements()
        ));
    }
    
    @PostMapping
    public ResponseEntity<?> createProduct(
            @RequestBody Product product,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole) {
        
        try {
            if (!"SELLER".equals(userRole) && !"ADMIN".equals(userRole)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Unauthorized to create products"
                ));
            }
            
            product.setSellerId(userId);
            Product savedProduct = productService.createProduct(product);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Product created successfully",
                "product", savedProduct
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable String id,
            @RequestBody Product product,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole) {
        
        try {
            Product updatedProduct = productService.updateProduct(id, product, userId, userRole);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Product updated successfully",
                "product", updatedProduct
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole) {
        
        try {
            productService.deleteProduct(id, userId, userRole);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Product deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/health")
    public String health() {
        return "Product Service is running";
    }
    
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllProducts(@RequestHeader("X-User-Role") String userRole) {
        if (!"ADMIN".equals(userRole)) {
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "message", "Access denied. Admin role required."
            ));
        }
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", java.util.Arrays.asList(
                Map.of("id", 1, "name", "iPhone 15 Pro Max", "seller", "Apple Store", "price", 134900, "status", "ACTIVE", "stock", 50, "category", "Electronics"),
                Map.of("id", 2, "name", "Samsung Galaxy S24", "seller", "Samsung Official", "price", 124999, "status", "ACTIVE", "stock", 30, "category", "Electronics"),
                Map.of("id", 3, "name", "OnePlus 12", "seller", "OnePlus Store", "price", 64999, "status", "PENDING", "stock", 25, "category", "Electronics")
            )
        ));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getProductStats() {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "total", 2340,
            "growth", "+8%",
            "active", 2100,
            "pending", 180,
            "inactive", 60
        ));
    }
}
