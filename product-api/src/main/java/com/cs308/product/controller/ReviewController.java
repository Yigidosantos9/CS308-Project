package com.cs308.product.controller;

import com.cs308.product.model.CreateReviewRequest;
import com.cs308.product.model.ReviewResponse;
import com.cs308.product.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * Add a review (called from gateway with userId from token)
     */
    @PostMapping
    public ResponseEntity<ReviewResponse> addReview(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateReviewRequest request) {
        log.info("Add review request: userId={}, productId={}, rating={}",
                userId, request.getProductId(), request.getRating());
        ReviewResponse response = reviewService.addReview(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get approved reviews for a product (public)
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(@PathVariable Long productId) {
        log.info("Get reviews for product: {}", productId);
        return ResponseEntity.ok(reviewService.getApprovedReviews(productId));
    }

    /**
     * Get all reviews for a product including pending (Product Manager)
     */
    @GetMapping("/product/{productId}/all")
    public ResponseEntity<List<ReviewResponse>> getAllProductReviews(@PathVariable Long productId) {
        log.info("Get all reviews for product: {}", productId);
        return ResponseEntity.ok(reviewService.getAllReviews(productId));
    }

    /**
     * Get pending reviews queue (Product Manager)
     */
    @GetMapping("/pending")
    public ResponseEntity<List<ReviewResponse>> getPendingReviews() {
        log.info("Get pending reviews");
        return ResponseEntity.ok(reviewService.getPendingReviews());
    }

    /**
     * Approve a review (Product Manager)
     */
    @PutMapping("/{reviewId}/approve")
    public ResponseEntity<ReviewResponse> approveReview(@PathVariable Long reviewId) {
        log.info("Approve review: {}", reviewId);
        return ResponseEntity.ok(reviewService.approveReview(reviewId));
    }

    /**
     * Disapprove a review (Product Manager)
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> disapproveReview(@PathVariable Long reviewId) {
        log.info("Disapprove review: {}", reviewId);
        reviewService.disapproveReview(reviewId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get average rating and review count for a product
     */
    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<Map<String, Object>> getProductReviewStats(@PathVariable Long productId) {
        log.info("Get review stats for product: {}", productId);
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", reviewService.getAverageRating(productId));
        stats.put("reviewCount", reviewService.getReviewCount(productId));
        return ResponseEntity.ok(stats);
    }
}
