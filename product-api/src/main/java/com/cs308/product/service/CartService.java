package com.cs308.product.service;

import com.cs308.product.domain.Cart;
import com.cs308.product.domain.CartItem;
import com.cs308.product.domain.Product;
import com.cs308.product.repository.CartRepository;
import com.cs308.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Cart addToCart(Long userId, Long productId, int qty) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setUserId(userId);
                    return c;
                });

        CartItem existing = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            int newQty = existing.getQuantity() + qty;
            if (newQty > product.getStock()) {
                throw new RuntimeException("Not enough stock");
            }
            existing.setQuantity(newQty);
        } else {
            if (qty > product.getStock()) {
                throw new RuntimeException("Not enough stock");
            }
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(qty)
                    .build();

            cart.addItem(newItem);
        }

        recalcTotals(cart);
        return cartRepository.save(cart);
    }

    @Transactional(readOnly = true)
    public Cart getCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
    }

    @Transactional
    public Cart removeFromCart(Long userId, Long productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not in cart"));

        cart.removeItem(item);
        recalcTotals(cart);
        return cartRepository.save(cart);
    }

    private void recalcTotals(Cart cart) {
        double totalPrice = 0;
        int totalQty = 0;

        for (CartItem item : cart.getItems()) {
            totalPrice += item.getProduct().getPrice() * item.getQuantity();
            totalQty += item.getQuantity();
        }

        cart.setTotalPrice(totalPrice);
        cart.setTotalQuantity(totalQty);
    }
}
