package com.peraxis.product.config;

import com.peraxis.product.entity.Product;
import com.peraxis.product.entity.ProductStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;


import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) throws Exception {
        if (mongoTemplate.count(new Query(), Product.class) == 0) {
            createSampleProducts();
        }
    }

    private void createSampleProducts() {
        Product[] products = {
            createProduct("iPhone 15 Pro", "Latest iPhone with A17 Pro chip", 999.99, 1199.99, "Electronics", true, true, 4.8, 1250),
            createProduct("MacBook Pro M3", "High-performance laptop for professionals", 1999.99, 2299.99, "Electronics", true, false, 4.7, 890),
            createProduct("AirPods Pro 2", "Premium wireless headphones with ANC", 249.99, 0.0, "Electronics", false, true, 4.6, 2100),
            createProduct("Apple Watch Series 9", "Advanced fitness and health tracking", 399.99, 449.99, "Electronics", true, true, 4.5, 1560),
            createProduct("PlayStation 5", "Next-gen gaming console", 499.99, 0.0, "Gaming", false, true, 4.9, 3200),
            createProduct("Samsung Galaxy S24", "Flagship Android smartphone", 799.99, 899.99, "Electronics", true, true, 4.4, 980),
            createProduct("Dell XPS 13", "Ultra-portable laptop", 1299.99, 1499.99, "Electronics", false, false, 4.3, 650),
            createProduct("Sony WH-1000XM5", "Industry-leading noise canceling", 349.99, 399.99, "Electronics", false, true, 4.7, 1890)
        };

        mongoTemplate.insertAll(Arrays.asList(products));
        System.out.println("Sample products created!");
    }

    private Product createProduct(String name, String description, Double price, Double originalPrice, String category, boolean featured, boolean trending, Double rating, Integer reviewCount) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setOriginalPrice(originalPrice);
        if (originalPrice > 0) {
            product.setDiscount(((originalPrice - price) / originalPrice) * 100);
        }
        product.setCategory(category);
        product.setFeatured(featured);
        product.setTrending(trending);
        product.setRating(rating);
        product.setReviewCount(reviewCount);
        product.setStatus(ProductStatus.ACTIVE);
        product.setStock(100);
        product.setSellerId("seller1");
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        return product;
    }
}