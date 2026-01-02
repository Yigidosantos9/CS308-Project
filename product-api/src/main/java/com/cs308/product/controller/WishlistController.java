package com.cs308.product.controller;

import com.cs308.product.domain.Wishlist;
import com.cs308.product.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/add")
    public ResponseEntity<Wishlist> addToWishlist(@RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam(required = false) String size) {
        return ResponseEntity.ok(wishlistService.addToWishlist(userId, productId, size));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Wishlist> removeFromWishlist(@RequestParam Long userId,
            @RequestParam Long productId) {
        return ResponseEntity.ok(wishlistService.removeFromWishlist(userId, productId));
    }

    @GetMapping
    public ResponseEntity<Wishlist> getWishlist(@RequestParam Long userId) {
        return ResponseEntity.ok(wishlistService.getWishlist(userId));
    }

    /**
     * Get all user IDs that have a specific product in their wishlist.
     * Used for sending discount notifications.
     */
    @GetMapping("/users-with-product/{productId}")
    public ResponseEntity<List<Long>> getUsersWithProductInWishlist(@PathVariable Long productId) {
        List<Long> userIds = wishlistService.getUserIdsWithProductInWishlist(productId);
        return ResponseEntity.ok(userIds);
    }
}
