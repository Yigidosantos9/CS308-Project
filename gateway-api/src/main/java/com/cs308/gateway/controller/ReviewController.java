package com.cs308.gateway.controller;

import com.cs308.gateway.model.auth.enums.UserType;
import com.cs308.gateway.security.RequiresRole;
import com.cs308.gateway.security.SecurityContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    // Customers can add reviews (only for delivered products)
    @PostMapping
    @RequiresRole({UserType.CUSTOMER})
    public ResponseEntity<?> addReview(@RequestBody Object reviewRequest) {
        Long userId = SecurityContext.getContext().getUserId();
        log.info("BFF: Add review request received from user: {}", userId);
        // TODO: Implement add review
        return ResponseEntity.ok().build();
    }

    // Anyone can view reviews (no authentication required)
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductReviews(@PathVariable Long productId) {
        log.info("BFF: Get reviews request for product: {}", productId);
        // TODO: Implement get reviews
        return ResponseEntity.ok().build();
    }

    // Product Manager can approve/disapprove comments
    @PutMapping("/{reviewId}/approve")
    @RequiresRole({UserType.PRODUCT_MANAGER})
    public ResponseEntity<?> approveReview(@PathVariable Long reviewId) {
        log.info("BFF: Approve review request - reviewId: {}", reviewId);
        // TODO: Implement approve review
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{reviewId}/disapprove")
    @RequiresRole({UserType.PRODUCT_MANAGER})
    public ResponseEntity<?> disapproveReview(@PathVariable Long reviewId) {
        log.info("BFF: Disapprove review request - reviewId: {}", reviewId);
        // TODO: Implement disapprove review
        return ResponseEntity.ok().build();
    }
}

