package com.peraxis.admin.config;

import com.peraxis.admin.service.AdminUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);
    
    @Autowired
    private AdminUserService adminUserService;
    
    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing admin service...");
        
        // Initialize default admin users if they don't exist
        adminUserService.initializeDefaultAdmins();
        
        logger.info("Admin service initialization completed");
    }
}