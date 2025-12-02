package com.cs308.product.controller;

import com.cs308.product.domain.Cart;
import com.cs308.product.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(@RequestParam Long userId,
                                          @RequestParam Long productId,
                                          @RequestParam(defaultValue = "1") Integer quantity) {
        return ResponseEntity.ok(cartService.addToCart(userId, productId, quantity));
    }

    @GetMapping
    public ResponseEntity<Cart> getCart(@RequestParam Long userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Cart> removeFromCart(@RequestParam Long userId,
                                               @RequestParam Long productId) {
        return ResponseEntity.ok(cartService.removeFromCart(userId, productId));
    }

    @PutMapping("/update")
    public ResponseEntity<Cart> updateCartItemQuantity(@RequestParam Long userId,
                                                      @RequestParam Long productId,
                                                      @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateCartItemQuantity(userId, productId, quantity));
    }

    @PostMapping("/merge")
    public ResponseEntity<Cart> mergeCarts(@RequestParam Long guestUserId,
                                          @RequestParam Long userId) {
        return ResponseEntity.ok(cartService.mergeCarts(guestUserId, userId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Cart> clearCart(@RequestParam Long userId) {
        return ResponseEntity.ok(cartService.clearCart(userId));
    }

}
