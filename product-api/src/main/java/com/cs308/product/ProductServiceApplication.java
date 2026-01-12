package com.cs308.product;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProductServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner init(
            com.cs308.product.service.CategoryService categoryService,
            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE products DROP CONSTRAINT IF EXISTS products_product_type_check");
                System.out.println("Dropped products_product_type_check constraint");
            } catch (Exception e) {
                System.out.println("Could not drop constraint: " + e.getMessage());
            }
            categoryService.initializeDefaultCategories();
        };
    }
}
