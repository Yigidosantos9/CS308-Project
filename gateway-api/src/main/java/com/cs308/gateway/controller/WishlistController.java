package com.cs308.gateway.controller;

import com.cs308.gateway.model.auth.enums.UserType;
import com.cs308.gateway.model.product.Wishlist;
import com.cs308.gateway.security.RequiresRole;
import com.cs308.gateway.security.SecurityContext;
import com.cs308.gateway.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@RequiresRole({ UserType.CUSTOMER })
public class WishlistController {

    private final ProductService productService;

    @PostMapping("/add")
    public ResponseEntity<Wishlist> addToWishlist(
            @AuthenticationPrincipal SecurityContext securityContext,
            @RequestParam Long productId,
            @RequestParam(required = false) String size) {
        log.info("BFF: Add to wishlist request received - productId: {}, size: {}", productId, size);

        try {
            if (securityContext == null) {
                log.warn("User not authenticated for add to wishlist");
                return ResponseEntity.status(401).build();
            }

            Long userId = securityContext.getUserId();
            Wishlist wishlist = productService.addToWishlist(userId, productId, size);
            return ResponseEntity.ok(wishlist);
        } catch (RuntimeException e) {
            log.error("Error processing add to wishlist request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Wishlist> removeFromWishlist(
            @AuthenticationPrincipal SecurityContext securityContext,
            @RequestParam Long productId) {
        log.info("BFF: Remove from wishlist request received - productId: {}", productId);

        try {
            if (securityContext == null) {
                log.warn("User not authenticated for remove from wishlist");
                return ResponseEntity.status(401).build();
            }

            Long userId = securityContext.getUserId();
            Wishlist wishlist = productService.removeFromWishlist(userId, productId);
            return ResponseEntity.ok(wishlist);
        } catch (RuntimeException e) {
            log.error("Error processing remove from wishlist request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<Wishlist> getWishlist(
            @AuthenticationPrincipal SecurityContext securityContext) {
        log.info("BFF: Get wishlist request received");

        try {
            if (securityContext == null) {
                log.warn("User not authenticated for get wishlist");
                return ResponseEntity.status(401).build();
            }

            Long userId = securityContext.getUserId();
            Wishlist wishlist = productService.getWishlist(userId);
            return ResponseEntity.ok(wishlist);
        } catch (RuntimeException e) {
            log.error("Error processing get wishlist request", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
