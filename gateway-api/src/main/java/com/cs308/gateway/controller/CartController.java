package com.cs308.gateway.controller;

import com.cs308.gateway.model.product.Cart;
import com.cs308.gateway.security.SecurityContext;
import com.cs308.gateway.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final ProductService productService;

    // Customers can add to cart (guests can also add, but we'll use authenticated
    // user's ID if available)
    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(
            @AuthenticationPrincipal SecurityContext securityContext,
            @RequestParam(required = false) Long userId,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") Integer quantity,
            @RequestParam(required = false) String size) {
        log.info("BFF: Add to cart request received - userId: {}, productId: {}, quantity: {}, size: {}",
                userId, productId, quantity, size);

        try {
            // If user is authenticated, use their ID; otherwise use provided userId (for
            // guests)
            Long actualUserId = (securityContext != null)
                    ? securityContext.getUserId()
                    : userId;

            if (actualUserId == null) {
                return ResponseEntity.badRequest().build();
            }

            Cart cart = productService.addToCart(actualUserId, productId, quantity, size);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            log.error("Error processing add to cart request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Customers can view their cart
    @GetMapping
    public ResponseEntity<Cart> getCart(
            @AuthenticationPrincipal SecurityContext securityContext,
            @RequestParam(required = false) Long userId) {
        log.info("BFF: Get cart request received for userId: {}", userId);

        try {
            // If user is authenticated, use their ID; otherwise use provided userId (for
            // guests)
            Long actualUserId = (securityContext != null)
                    ? securityContext.getUserId()
                    : userId;

            if (actualUserId == null) {
                return ResponseEntity.badRequest().build();
            }

            Cart cart = productService.getCart(actualUserId);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            log.error("Error processing get cart request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Cart> removeFromCart(
            @AuthenticationPrincipal SecurityContext securityContext,
            @RequestParam(required = false) Long userId,
            @RequestParam Long productId) {
        log.info("BFF: Remove from cart request received - userId: {}, productId: {}", userId, productId);

        try {
            Long actualUserId = (securityContext != null)
                    ? securityContext.getUserId()
                    : userId;

            if (actualUserId == null) {
                return ResponseEntity.badRequest().build();
            }

            Cart cart = productService.removeFromCart(actualUserId, productId);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            log.error("Error processing remove from cart request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Cart> updateCartItemQuantity(
            @RequestParam(required = false) Long userId,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        log.info("BFF: Update cart item quantity request received - userId: {}, productId: {}, quantity: {}",
                userId, productId, quantity);

        try {
            Long actualUserId = SecurityContext.isAuthenticated()
                    ? SecurityContext.getContext().getUserId()
                    : userId;

            if (actualUserId == null) {
                return ResponseEntity.badRequest().build();
            }

            Cart cart = productService.updateCartItemQuantity(actualUserId, productId, quantity);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            log.error("Error processing update cart item quantity request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Merge guest cart into user cart (used on login)
    @PostMapping("/merge")
    public ResponseEntity<Cart> mergeCarts(
            @AuthenticationPrincipal SecurityContext securityContext,
            @RequestParam Long guestUserId,
            @RequestParam Long userId) {
        log.info("BFF: Merge carts request received - guestUserId: {}, userId: {}", guestUserId, userId);

        try {
            Cart cart = productService.mergeCarts(guestUserId, userId);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            log.error("Error merging carts", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
