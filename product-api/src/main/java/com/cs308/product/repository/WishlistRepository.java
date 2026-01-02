package com.cs308.product.repository;

import com.cs308.product.domain.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Optional<Wishlist> findByUserId(Long userId);

    /**
     * Find all wishlists that contain a specific product.
     * Used to notify users when a product in their wishlist gets a discount.
     */
    List<Wishlist> findByItems_Product_Id(Long productId);
}
