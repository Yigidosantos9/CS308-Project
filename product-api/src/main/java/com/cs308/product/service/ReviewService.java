package com.cs308.product.service;

import com.cs308.product.domain.Product;
import com.cs308.product.domain.Review;
import com.cs308.product.model.CreateReviewRequest;
import com.cs308.product.model.ReviewResponse;
import com.cs308.product.repository.ProductRepository;
import com.cs308.product.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    // ... (Your existing addReview, getApprovedReviews, etc. methods remain here) ...

    @Transactional
    public ReviewResponse addReview(Long userId, CreateReviewRequest request) {
        Optional<Review> existingReview =
                reviewRepository.findByProductIdAndUserId(request.getProductId(), userId);
        if (existingReview.isPresent()) {
            throw new IllegalStateException("You have already reviewed this product");
        }
        Review review = Review.builder()
                .productId(request.getProductId())
                .userId(userId)
                .rating(request.getRating())
                .comment(request.getComment())
                .approved(false) 
                .build();
        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    public List<ReviewResponse> getApprovedReviews(Long productId) {
        return reviewRepository.findByProductIdAndApprovedTrueOrderByCreatedAtDesc(productId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ReviewResponse> getAllReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ReviewResponse> getPendingReviews() {
        return reviewRepository.findByApprovedFalseOrderByCreatedAtAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        review.setApproved(true);
        Review saved = reviewRepository.save(review);
        
        // Update product table
        recalculateProductRating(saved.getProductId());
        
        return toResponse(saved);
    }

    @Transactional
    public void disapproveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        Long productId = review.getProductId();
        reviewRepository.delete(review);
        
        // Update product table
        recalculateProductRating(productId);
    }

    public Double getAverageRating(Long productId) {
        return reviewRepository.calculateAverageRating(productId);
    }

    public long getReviewCount(Long productId) {
        return reviewRepository.countByProductIdAndApprovedTrue(productId);
    }

    /**
     * Helper: Updates the Product entity with latest stats from Review table.
     */
    @Transactional
    public void recalculateProductRating(Long productId) {
        Double avg = reviewRepository.calculateAverageRating(productId);
        long count = reviewRepository.countByProductIdAndApprovedTrue(productId);

        productRepository.findById(productId).ifPresent(product -> {
            // Handle nulls safely
            double safeAvg = (avg != null) ? avg : 0.0;
            product.setAverageRating(safeAvg);
            product.setReviewCount(count);
            productRepository.save(product);
            log.info("Synced rating for Product {}: Avg={}, Count={}", productId, safeAvg, count);
        });
    }

    /**
     * 🟢 NEW: Run this once to fix your database sorting
     */
// In ReviewService.java

@Transactional
public void syncAllRatings() {
    List<Product> allProducts = productRepository.findAll();
    for (Product product : allProducts) {
        Double avg = reviewRepository.calculateAverageRating(product.getId());
        long count = reviewRepository.countByProductIdAndApprovedTrue(product.getId());

        // Handle NULLs from DB
        product.setAverageRating(avg != null ? avg : 0.0);
        product.setReviewCount(count);
        productRepository.save(product);
    }
}

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProductId())
                .userId(review.getUserId())
                .rating(review.getRating())
                .comment(review.getComment())
                .approved(review.isApproved())
                .createdAt(review.getCreatedAt())
                .build();
    }
}