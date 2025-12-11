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
    public Cart addToCart(Long userId, Long productId, int qty, String size) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() == null || product.getStock() <= 0) {
            throw new OutOfStockException(productId);
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setUserId(userId);
                    return c;
                });

        // Find existing item by productId AND size
        final String itemSize = size;
        CartItem existing = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId) &&
                        java.util.Objects.equals(i.getSize(), itemSize))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            int newQty = existing.getQuantity() + qty;
            if (newQty > product.getStock()) {
                throw new OutOfStockException("Not enough stock for product " + productId);
            }
            existing.setQuantity(newQty);
        } else {
            if (qty > product.getStock()) {
                throw new OutOfStockException("Not enough stock for product " + productId);
            }
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(qty)
                    .size(size)
                    .build();

            cart.addItem(newItem);
        }

        recalcTotals(cart);
        return cartRepository.save(cart);
    }

    @Transactional(readOnly = true)
    public Cart getCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Return an empty cart (not persisted)
                    Cart emptyCart = new Cart();
                    emptyCart.setUserId(userId);
                    emptyCart.setTotalPrice(0.0);
                    emptyCart.setTotalQuantity(0);
                    return emptyCart;
                });
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

    @Transactional
    public Cart clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.getItems().clear();
        recalcTotals(cart);
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateCartItemQuantity(Long userId, Long productId, Integer quantity) {
        if (quantity == null || quantity < 0) {
            throw new RuntimeException("Quantity must be non-negative");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not in cart"));

        if (quantity == 0) {
            cart.removeItem(item);
        } else {
            if (quantity > product.getStock()) {
                throw new RuntimeException("Not enough stock");
            }
            item.setQuantity(quantity);
        }

        recalcTotals(cart);
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart mergeCarts(Long guestUserId, Long userId) {
        Cart guestCart = cartRepository.findByUserId(guestUserId).orElse(null);

        // If guest cart doesn't exist or is empty, nothing to merge
        if (guestCart == null || guestCart.getItems().isEmpty()) {
            return cartRepository.findByUserId(userId)
                    .orElseGet(() -> {
                        Cart newCart = new Cart();
                        newCart.setUserId(userId);
                        return cartRepository.save(newCart);
                    });
        }

        // Ensure user cart exists
        cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    return cartRepository.save(newCart);
                });

        // Move each guest item using the existing addToCart logic (handles stock, sizing, totals)
        for (CartItem guestItem : guestCart.getItems()) {
            Product product = guestItem.getProduct();
            int qty = guestItem.getQuantity();
            String size = guestItem.getSize();

            // Reuse addToCart to avoid duplication/stock issues
            addToCart(userId, product.getId(), qty, size);
        }

        // After moving items, delete guest cart (orphans will cascade)
        cartRepository.delete(guestCart);

        // Return the merged user cart
        return cartRepository.findByUserId(userId).orElseThrow();
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
