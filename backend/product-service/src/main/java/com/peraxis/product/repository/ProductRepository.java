package com.peraxis.product.repository;

import com.peraxis.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    Page<Product> findByStatus(String status, Pageable pageable);
    Page<Product> findByCategory(String category, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    List<Product> findByFeaturedTrue();
    List<Product> findByTrendingTrue();
    
    @Query("{'$text': {'$search': ?0}}")
    Page<Product> findByTextSearch(String searchText, Pageable pageable);
}
