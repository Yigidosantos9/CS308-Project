package com.cs308.product.config;

import com.cs308.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryService categoryService;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing data...");

        try {
            jdbcTemplate.execute("ALTER TABLE products DROP CONSTRAINT IF EXISTS products_product_type_check");
            log.info("Dropped products_product_type_check constraint");
        } catch (Exception e) {
            log.error("Could not drop constraint: " + e.getMessage());
        }

        categoryService.initializeDefaultCategories();
    }
}
