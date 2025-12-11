package com.cs308.gateway.controller;

import com.cs308.gateway.client.ProductClient;
import com.cs308.gateway.model.auth.enums.UserType;
import com.cs308.gateway.security.SecurityContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ProductClient productClient;

    // Customers can add reviews (only for delivered products)
    @PostMapping
    public ResponseEntity<?> addReview(
            @AuthenticationPrincipal SecurityContext securityContext,
            @RequestBody Object reviewRequest) {
        Long userId = securityContext.getUserId();
        log.info("BFF: Add review request received from user: {}", userId);

        // TODO: Verify user has a delivered order for this product (call order-api)
        // For now, forward to product-api which will create the review

        Object response = productClient.addReview(userId, reviewRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Anyone can view reviews (no authentication required)
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductReviews(@PathVariable Long productId) {
        log.info("BFF: Get reviews request for product: {}", productId);
        return ResponseEntity.ok(productClient.getProductReviews(productId));
    }

    // Get review stats (average rating, count)
    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<?> getProductReviewStats(@PathVariable Long productId) {
        log.info("BFF: Get review stats for product: {}", productId);
        return ResponseEntity.ok(productClient.getProductReviewStats(productId));
    }

    // Get recent approved reviews for home page (public, no auth needed)
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentReviews() {
        log.info("BFF: Get recent approved reviews");
        return ResponseEntity.ok(productClient.getRecentReviews());
    }

    // Product Manager - Get pending reviews for approval
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingReviews(
            @AuthenticationPrincipal SecurityContext securityContext) {
        if (securityContext.getUserType() != UserType.PRODUCT_MANAGER) {
            log.warn("Unauthorized access to pending reviews by user: {}", securityContext.getUserId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Product Managers can view pending reviews");
        }
        log.info("BFF: Get pending reviews request from Product Manager: {}", securityContext.getUserId());
        return ResponseEntity.ok(productClient.getPendingReviews());
    }

    // Product Manager can approve comments
    @PutMapping("/{reviewId}/approve")
    public ResponseEntity<?> approveReview(
            @AuthenticationPrincipal SecurityContext securityContext,
            @PathVariable Long reviewId) {
        if (securityContext.getUserType() != UserType.PRODUCT_MANAGER) {
            log.warn("Unauthorized approve attempt by user: {}", securityContext.getUserId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Product Managers can approve reviews");
        }
        log.info("BFF: Approve review request - reviewId: {} by PM: {}", reviewId, securityContext.getUserId());
        return ResponseEntity.ok(productClient.approveReview(reviewId));
    }

    // Product Manager can disapprove (delete) comments
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> disapproveReview(
            @AuthenticationPrincipal SecurityContext securityContext,
            @PathVariable Long reviewId) {
        if (securityContext.getUserType() != UserType.PRODUCT_MANAGER) {
            log.warn("Unauthorized disapprove attempt by user: {}", securityContext.getUserId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Product Managers can disapprove reviews");
        }
        log.info("BFF: Disapprove review request - reviewId: {} by PM: {}", reviewId, securityContext.getUserId());
        productClient.disapproveReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
