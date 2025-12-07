package com.cs308.product.repository;

import com.cs308.product.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * Find all approved reviews for a product (public display)
     */
    List<Review> findByProductIdAndApprovedTrueOrderByCreatedAtDesc(Long productId);

    /**
     * Find all reviews for a product (for Product Manager)
     */
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    /**
     * Find pending reviews (not approved yet)
     */
    List<Review> findByApprovedFalseOrderByCreatedAtAsc();

    /**
     * Check if user already reviewed this product
     */
    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);

    /**
     * Calculate average rating for a product (only approved reviews)
     */
    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.productId = :productId AND r.approved = true")
    Double calculateAverageRating(@Param("productId") Long productId);

    /**
     * Count approved reviews for a product
     */
    long countByProductIdAndApprovedTrue(Long productId);
}
