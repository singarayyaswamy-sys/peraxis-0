package com.peraxis.ai.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class EnvironmentConfig {

    private final ConfigurableEnvironment environment;

    public EnvironmentConfig(ConfigurableEnvironment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void loadEnvironmentVariables() {
        try {
            Path envFile = Paths.get("../../.env");
            if (Files.exists(envFile)) {
                Map<String, Object> envProps = new HashMap<>();
                Files.lines(envFile)
                    .filter(line -> !line.startsWith("#") && line.contains("="))
                    .forEach(line -> {
                        String[] parts = line.split("=", 2);
                        if (parts.length == 2) {
                            envProps.put(parts[0].trim(), parts[1].trim());
                        }
                    });
                environment.getPropertySources().addFirst(new MapPropertySource("envFile", envProps));
            }
        } catch (IOException e) {
            // Ignore if .env file doesn't exist
        }
    }
}