package com.peraxis.location.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;

@Configuration
public class LocationConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("serviceability", "deliveryEstimate");
    }
}