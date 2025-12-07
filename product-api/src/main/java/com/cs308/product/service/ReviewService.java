package com.cs308.product.service;

import com.cs308.product.domain.Review;
import com.cs308.product.model.CreateReviewRequest;
import com.cs308.product.model.ReviewResponse;
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

    /**
     * Add a new review for a product.
     * Note: The caller (gateway) should verify that the user has a delivered order
     * for this product.
     */
    @Transactional
    public ReviewResponse addReview(Long userId, CreateReviewRequest request) {
        // Check if user already reviewed this product
        Optional<Review> existingReview = reviewRepository.findByProductIdAndUserId(request.getProductId(), userId);
        if (existingReview.isPresent()) {
            throw new IllegalStateException("You have already reviewed this product");
        }

        Review review = Review.builder()
                .productId(request.getProductId())
                .userId(userId)
                .rating(request.getRating())
                .comment(request.getComment())
                .approved(false) // Requires Product Manager approval
                .build();

        Review saved = reviewRepository.save(review);
        log.info("Review created: id={}, productId={}, userId={}, rating={}",
                saved.getId(), saved.getProductId(), saved.getUserId(), saved.getRating());

        return toResponse(saved);
    }

    /**
     * Get approved reviews for a product (public view)
     */
    public List<ReviewResponse> getApprovedReviews(Long productId) {
        return reviewRepository.findByProductIdAndApprovedTrueOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all reviews for a product (Product Manager view)
     */
    public List<ReviewResponse> getAllReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get pending reviews (for Product Manager approval queue)
     */
    public List<ReviewResponse> getPendingReviews() {
        return reviewRepository.findByApprovedFalseOrderByCreatedAtAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Approve a review (Product Manager only)
     */
    @Transactional
    public ReviewResponse approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        review.setApproved(true);
        Review saved = reviewRepository.save(review);
        log.info("Review approved: id={}", reviewId);

        return toResponse(saved);
    }

    /**
     * Disapprove (delete) a review (Product Manager only)
     */
    @Transactional
    public void disapproveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        reviewRepository.delete(review);
        log.info("Review disapproved and deleted: id={}", reviewId);
    }

    /**
     * Get average rating for a product
     */
    public Double getAverageRating(Long productId) {
        return reviewRepository.calculateAverageRating(productId);
    }

    /**
     * Get review count for a product
     */
    public long getReviewCount(Long productId) {
        return reviewRepository.countByProductIdAndApprovedTrue(productId);
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
