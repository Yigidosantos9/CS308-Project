package com.cs308.gateway.service;

import com.cs308.gateway.client.ProductClient;
import com.cs308.gateway.model.product.Cart;
import com.cs308.gateway.model.product.Product;
import com.cs308.gateway.model.product.ProductFilterRequest;
import com.cs308.gateway.model.product.StockRestoreRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductClient productClient;

    public List<Product> listProducts(ProductFilterRequest filter) {
        log.info("Processing list products request with filter: {}", filter);
        return productClient.listProducts(filter);
    }

    public Product getProduct(Long id) {
        log.info("Processing get product request for id: {}", id);
        return productClient.getProduct(id);
    }

    public Cart addToCart(Long userId, Long productId, Integer quantity) {
        log.info("Processing add to cart request - userId: {}, productId: {}, quantity: {}", 
                userId, productId, quantity);
        return productClient.addToCart(userId, productId, quantity);
    }

    public Cart getCart(Long userId) {
        log.info("Processing get cart request for userId: {}", userId);
        return productClient.getCart(userId);
    }

    public Cart removeFromCart(Long userId, Long productId) {
        log.info("Processing remove from cart request - userId: {}, productId: {}", userId, productId);
        return productClient.removeFromCart(userId, productId);
    }

    public Cart updateCartItemQuantity(Long userId, Long productId, Integer quantity) {
        log.info("Processing update cart item quantity request - userId: {}, productId: {}, quantity: {}", 
                userId, productId, quantity);
        return productClient.updateCartItemQuantity(userId, productId, quantity);
    }

    public Cart mergeCarts(Long guestUserId, Long userId) {
        log.info("Processing merge carts request - guestUserId: {}, userId: {}", guestUserId, userId);
        return productClient.mergeCarts(guestUserId, userId);
    }

    public Product setProductPrice(Long productId, Double price) {
        log.info("Processing set product price - productId: {}, price: {}", productId, price);
        if (price == null || price < 0) {
            throw new IllegalArgumentException("Price must be non-negative");
        }
        return productClient.setProductPrice(productId, price);
    }

    public Product restoreStock(StockRestoreRequest request) {
        log.info("Processing restore stock request: {}", request);
        return productClient.restoreStock(request);
    }
}
