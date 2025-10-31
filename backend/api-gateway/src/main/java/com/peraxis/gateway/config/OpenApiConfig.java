package com.peraxis.gateway.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI peraxisOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Peraxis E-commerce API Gateway")
                        .description("AI-powered e-commerce platform API gateway")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Peraxis Team")
                                .email("api@peraxis.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}