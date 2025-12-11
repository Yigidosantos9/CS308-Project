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

    @PostMapping
    public ResponseEntity<ReviewResponse> addReview(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewResponse response = reviewService.addReview(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getApprovedReviews(productId));
    }

    @GetMapping("/product/{productId}/all")
    public ResponseEntity<List<ReviewResponse>> getAllProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getAllReviews(productId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ReviewResponse>> getPendingReviews() {
        return ResponseEntity.ok(reviewService.getPendingReviews());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ReviewResponse>> getRecentReviews() {
        return ResponseEntity.ok(reviewService.getRecentApprovedReviews());
    }

    @PutMapping("/{reviewId}/approve")
    public ResponseEntity<ReviewResponse> approveReview(@PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewService.approveReview(reviewId));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> disapproveReview(@PathVariable Long reviewId) {
        reviewService.disapproveReview(reviewId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<Map<String, Object>> getProductReviewStats(@PathVariable Long productId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", reviewService.getAverageRating(productId));
        stats.put("reviewCount", reviewService.getReviewCount(productId));
        return ResponseEntity.ok(stats);
    }

    /**
     * 🟢 NEW: Call this endpoint ONCE via Postman/cURL to fix your sorting.
     * POST http://localhost:8080/reviews/sync-ratings
     */
    @PostMapping("/sync-ratings")
    public ResponseEntity<String> syncRatings() {
        reviewService.syncAllRatings();
        return ResponseEntity.ok("All product ratings have been recalculated and synced.");
    }
}