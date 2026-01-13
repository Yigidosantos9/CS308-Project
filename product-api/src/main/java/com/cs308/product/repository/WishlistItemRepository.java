package com.cs308.product.repository;

import com.cs308.product.domain.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    @Modifying
    @Query("DELETE FROM WishlistItem w WHERE w.product.id = :productId")
    void deleteByProductId(Long productId);
}
