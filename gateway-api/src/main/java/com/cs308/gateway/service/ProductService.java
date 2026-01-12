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

    public Cart addToCart(Long userId, Long productId, Integer quantity, String size) {
        log.info("Processing add to cart request - userId: {}, productId: {}, quantity: {}, size: {}",
                userId, productId, quantity, size);
        return productClient.addToCart(userId, productId, quantity, size);
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

    public Product setDiscount(Long productId, Double discountRate) {
        log.info("Processing set discount - productId: {}, discountRate: {}", productId, discountRate);
        if (discountRate != null && (discountRate < 0 || discountRate > 100)) {
            throw new IllegalArgumentException("Discount rate must be between 0 and 100");
        }
        return productClient.setDiscount(productId, discountRate);
    }

    // ==================== WISHLIST METHODS ====================

    public com.cs308.gateway.model.product.Wishlist addToWishlist(Long userId, Long productId, String size) {
        log.info("Processing add to wishlist request - userId: {}, productId: {}, size: {}", userId, productId, size);
        return productClient.addToWishlist(userId, productId, size);
    }

    public com.cs308.gateway.model.product.Wishlist removeFromWishlist(Long userId, Long productId) {
        log.info("Processing remove from wishlist request - userId: {}, productId: {}", userId, productId);
        return productClient.removeFromWishlist(userId, productId);
    }

    public com.cs308.gateway.model.product.Wishlist getWishlist(Long userId) {
        log.info("Processing get wishlist request for userId: {}", userId);
        return productClient.getWishlist(userId);
    }

    /**
     * Get user IDs that have a specific product in their wishlist.
     * Used for sending discount notifications.
     */
    public List<Long> getUsersWithProductInWishlist(Long productId) {
        log.info("Processing get users with product in wishlist for productId: {}", productId);
        return productClient.getUsersWithProductInWishlist(productId);
    }

    // ==================== PRODUCT MANAGEMENT METHODS ====================

    public Product addProduct(com.cs308.gateway.model.product.CreateProductRequest request) {
        log.info("Processing add product request: {}", request.getName());
        return productClient.addProduct(request);
    }

    public Product updateProduct(Long id, com.cs308.gateway.model.product.ProductUpdateRequest request) {
        log.info("Processing update product request for id: {}", id);
        return productClient.updateProduct(id, request);
    }

    public void deleteProduct(Long id) {
        log.info("Processing delete product request for id: {}", id);
        productClient.deleteProduct(id);
    }

    public Product updateStock(Long id, Integer quantity) {
        log.info("Processing update stock request - productId: {}, quantity: {}", id, quantity);
        if (quantity == null || quantity < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }
        return productClient.updateStock(id, quantity);
    }

    public String uploadImage(byte[] fileBytes, String filename, String contentType) {
        log.info("Processing image upload request: {}", filename);
        return productClient.uploadImage(fileBytes, filename, contentType);
    }

    // ==================== CATEGORY METHODS ====================

    public List<?> getCategories() {
        log.info("Processing get categories request");
        return productClient.getCategories();
    }

    public Object addCategory(String name) {
        log.info("Processing add category request: {}", name);
        return productClient.addCategory(name);
    }

    public void deleteCategory(Long id) {
        log.info("Processing delete category request: {}", id);
        productClient.deleteCategory(id);
    }
}
