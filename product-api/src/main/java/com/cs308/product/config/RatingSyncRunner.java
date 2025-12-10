package com.cs308.product.config;

import com.cs308.product.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RatingSyncRunner implements CommandLineRunner {

    private final ReviewService reviewService;

    @Override
    public void run(String... args) {
        log.info("🔄 BOOT STRAP: Synchronizing Product Ratings...");
        try {
            reviewService.syncAllRatings();
            log.info("✅ BOOT STRAP: Ratings synchronized successfully.");
        } catch (Exception e) {
            log.error("❌ BOOT STRAP: Failed to sync ratings", e);
        }
    }
}