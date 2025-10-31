package com.peraxis.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebSocketProxyConfig {

    @Bean
    public RouteLocator websocketRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("websocket-route", r -> r
                        .path("/ws/**")
                        .uri("ws://localhost:8087"))
                .build();
    }
}