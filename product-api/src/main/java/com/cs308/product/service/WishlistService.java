package com.cs308.product.service;

import com.cs308.product.domain.Product;
import com.cs308.product.domain.Wishlist;
import com.cs308.product.domain.WishlistItem;
import com.cs308.product.repository.ProductRepository;
import com.cs308.product.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Wishlist addToWishlist(Long userId, Long productId, String size) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        Wishlist wishlist = wishlistRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wishlist w = new Wishlist();
                    w.setUserId(userId);
                    return w;
                });

        // Check if product already in wishlist (same product and size)
        boolean alreadyExists = wishlist.getItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(productId)
                        && (size == null ? item.getSize() == null : size.equals(item.getSize())));

        if (alreadyExists) {
            throw new RuntimeException("Product already in wishlist with this size");
        }

        WishlistItem newItem = WishlistItem.builder()
                .wishlist(wishlist)
                .product(product)
                .size(size)
                .build();

        wishlist.addItem(newItem);
        return wishlistRepository.save(wishlist);
    }

    @Transactional
    public Wishlist removeFromWishlist(Long userId, Long productId) {
        Wishlist wishlist = wishlistRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));

        WishlistItem item = wishlist.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not in wishlist"));

        wishlist.removeItem(item);
        return wishlistRepository.save(wishlist);
    }

    @Transactional(readOnly = true)
    public Wishlist getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Return an empty wishlist (not persisted)
                    Wishlist emptyWishlist = new Wishlist();
                    emptyWishlist.setUserId(userId);
                    return emptyWishlist;
                });
    }
}
