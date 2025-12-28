package com.cs308.gateway.client;

import com.cs308.gateway.model.product.Cart;
import com.cs308.gateway.model.product.Product;
import com.cs308.gateway.model.product.ProductFilterRequest;
import com.cs308.gateway.model.product.ProductPriceUpdateRequest;
import com.cs308.gateway.model.product.StockRestoreRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Slf4j
@Component
public class ProductClient {

    private final RestTemplate restTemplate;

    public ProductClient(@Qualifier("productRestTemplate") RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<Product> listProducts(ProductFilterRequest filter) {
        log.debug("Calling product service: GET /products with filter: {}", filter);

        try {
            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromPath("/products");
            if (filter.getQ() != null) {
                uriBuilder.queryParam("q", filter.getQ());
            }
            if (filter.getCategory() != null) {
                uriBuilder.queryParam("category", filter.getCategory());
            }
            if (filter.getGender() != null) {
                uriBuilder.queryParam("gender", filter.getGender());
            }
            if (filter.getTargetAudience() != null) {
                uriBuilder.queryParam("targetAudience", filter.getTargetAudience());
            }
            if (filter.getColor() != null) {
                uriBuilder.queryParam("color", filter.getColor());
            }
            if (filter.getSort() != null) {
                uriBuilder.queryParam("sort", filter.getSort());
            }

            ResponseEntity<List<Product>> response = restTemplate.exchange(
                    uriBuilder.toUriString(),
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Product>>() {
                    });

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service for list products", e);
            throw new RuntimeException("Failed to fetch products", e);
        }
    }

    public Product getProduct(Long id) {
        log.debug("Calling product service: GET /products/{}", id);

        try {
            Product product = restTemplate.getForObject(
                    "/products/{id}",
                    Product.class,
                    id);
            return product;
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("Product not found with id: {}", id);
            return null;
        } catch (RestClientException e) {
            log.error("Error calling product service for product id: {}", id, e);
            throw new RuntimeException("Failed to fetch product", e);
        }
    }

    public Cart addToCart(Long userId, Long productId, Integer quantity, String size) {
        log.debug("Calling product service: POST /cart/add - userId: {}, productId: {}, quantity: {}, size: {}",
                userId, productId, quantity, size);

        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromPath("/cart/add")
                    .queryParam("userId", userId)
                    .queryParam("productId", productId)
                    .queryParam("quantity", quantity);

            if (size != null && !size.isEmpty()) {
                builder.queryParam("size", size);
            }

            String uri = builder.toUriString();

            Cart cart = restTemplate.postForObject(uri, null, Cart.class);
            return cart;
        } catch (RestClientException e) {
            log.error("Error calling product service for add to cart", e);
            throw new RuntimeException("Failed to add item to cart", e);
        }
    }

    public Cart getCart(Long userId) {
        log.debug("Calling product service: GET /cart for userId: {}", userId);

        try {
            String uri = UriComponentsBuilder.fromPath("/cart")
                    .queryParam("userId", userId)
                    .toUriString();

            Cart cart = restTemplate.getForObject(uri, Cart.class);
            return cart;
        } catch (RestClientException e) {
            log.error("Error calling product service for get cart", e);
            throw new RuntimeException("Failed to fetch cart", e);
        }
    }

    public Cart removeFromCart(Long userId, Long productId) {
        log.debug("Calling product service: DELETE /cart/remove - userId: {}, productId: {}",
                userId, productId);

        try {
            String uri = UriComponentsBuilder.fromPath("/cart/remove")
                    .queryParam("userId", userId)
                    .queryParam("productId", productId)
                    .toUriString();

            ResponseEntity<Cart> response = restTemplate.exchange(
                    uri,
                    HttpMethod.DELETE,
                    null,
                    Cart.class);

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service for remove from cart", e);
            throw new RuntimeException("Failed to remove item from cart", e);
        }
    }

    public Cart updateCartItemQuantity(Long userId, Long productId, Integer quantity) {
        log.debug("Calling product service: PUT /cart/update - userId: {}, productId: {}, quantity: {}",
                userId, productId, quantity);

        try {
            String uri = UriComponentsBuilder.fromPath("/cart/update")
                    .queryParam("userId", userId)
                    .queryParam("productId", productId)
                    .queryParam("quantity", quantity)
                    .toUriString();

            ResponseEntity<Cart> response = restTemplate.exchange(
                    uri,
                    HttpMethod.PUT,
                    null,
                    Cart.class);

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service for update cart item quantity", e);
            throw new RuntimeException("Failed to update cart item quantity", e);
        }
    }

    public Cart mergeCarts(Long guestUserId, Long userId) {
        log.debug("Calling product service: POST /cart/merge - guestUserId: {}, userId: {}",
                guestUserId, userId);

        try {
            String uri = UriComponentsBuilder.fromPath("/cart/merge")
                    .queryParam("guestUserId", guestUserId)
                    .queryParam("userId", userId)
                    .toUriString();

            Cart cart = restTemplate.postForObject(uri, null, Cart.class);
            return cart;
        } catch (RestClientException e) {
            log.error("Error calling product service for merge carts", e);
            throw new RuntimeException("Failed to merge carts", e);
        }
    }

    public Product setProductPrice(Long productId, Double price) {
        log.debug("Calling product service: PUT /products/{} with price {}", productId, price);

        try {
            ProductPriceUpdateRequest body = ProductPriceUpdateRequest.builder()
                    .price(price)
                    .build();

            ResponseEntity<Product> response = restTemplate.exchange(
                    "/products/{id}",
                    HttpMethod.PUT,
                    new org.springframework.http.HttpEntity<>(body),
                    Product.class,
                    productId);

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service to set price for id: {}", productId, e);
            throw new RuntimeException("Failed to set product price", e);
        }
    }

    public Product restoreStock(StockRestoreRequest request) {
        log.debug("Calling product service: POST /products/restore-stock with body {}", request);

        try {
            ResponseEntity<Product> response = restTemplate.postForEntity(
                    "/products/restore-stock",
                    request,
                    Product.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service to restore stock", e);
            throw new RuntimeException("Failed to restore product stock", e);
        }
    }

    public Product setDiscount(Long productId, Double discountRate) {
        log.debug("Calling product service: POST /products/{}/discount?discountRate={}", productId, discountRate);

        try {
            String uri = UriComponentsBuilder.fromPath("/products/{productId}/discount")
                    .queryParam("discountRate", discountRate)
                    .buildAndExpand(productId)
                    .toUriString();

            ResponseEntity<Product> response = restTemplate.postForEntity(
                    uri,
                    null,
                    Product.class);

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service to set discount for id: {}", productId, e);
            throw new RuntimeException("Failed to set product discount", e);
        }
    }

    // ==================== REVIEW METHODS ====================

    public Object addReview(Long userId, Object reviewRequest) {
        log.debug("Calling product service: POST /reviews for userId: {}", userId);

        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("X-User-Id", String.valueOf(userId));
            org.springframework.http.HttpEntity<Object> entity = new org.springframework.http.HttpEntity<>(
                    reviewRequest, headers);

            ResponseEntity<Object> response = restTemplate.exchange(
                    "/reviews",
                    HttpMethod.POST,
                    entity,
                    Object.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service to add review", e);
            throw new RuntimeException("Failed to add review", e);
        }
    }

    public List<?> getProductReviews(Long productId) {
        log.debug("Calling product service: GET /reviews/product/{}", productId);

        try {
            ResponseEntity<List> response = restTemplate.exchange(
                    "/reviews/product/{productId}",
                    HttpMethod.GET,
                    null,
                    List.class,
                    productId);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service to get reviews", e);
            throw new RuntimeException("Failed to get reviews", e);
        }
    }

    public List<?> getPendingReviews() {
        log.debug("Calling product service: GET /reviews/pending");

        try {
            ResponseEntity<List> response = restTemplate.exchange(
                    "/reviews/pending",
                    HttpMethod.GET,
                    null,
                    List.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service to get pending reviews", e);
            throw new RuntimeException("Failed to get pending reviews", e);
        }
    }

    public Object approveReview(Long reviewId) {
        log.debug("Calling product service: PUT /reviews/{}/approve", reviewId);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                    "/reviews/{reviewId}/approve",
                    HttpMethod.PUT,
                    null,
                    Object.class,
                    reviewId);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service to approve review", e);
            throw new RuntimeException("Failed to approve review", e);
        }
    }

    public void disapproveReview(Long reviewId) {
        log.debug("Calling product service: DELETE /reviews/{}", reviewId);

        try {
            restTemplate.exchange(
                    "/reviews/{reviewId}",
                    HttpMethod.DELETE,
                    null,
                    Void.class,
                    reviewId);
        } catch (RestClientException e) {
            log.error("Error calling product service to disapprove review", e);
            throw new RuntimeException("Failed to disapprove review", e);
        }
    }

    public Object getProductReviewStats(Long productId) {
        log.debug("Calling product service: GET /reviews/product/{}/stats", productId);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                    "/reviews/product/{productId}/stats",
                    HttpMethod.GET,
                    null,
                    Object.class,
                    productId);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service to get review stats", e);
            throw new RuntimeException("Failed to get review stats", e);
        }
    }

    public List<?> getRecentReviews() {
        log.debug("Calling product service: GET /reviews/recent");

        try {
            ResponseEntity<List> response = restTemplate.exchange(
                    "/reviews/recent",
                    HttpMethod.GET,
                    null,
                    List.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service to get recent reviews", e);
            throw new RuntimeException("Failed to get recent reviews", e);
        }
    }

    public void reduceStock(Long productId, Integer quantity) {
        log.debug("Calling product service: PUT /products/{}/stock/reduce?quantity={}", productId, quantity);

        try {
            String uri = UriComponentsBuilder.fromPath("/products/{productId}/stock/reduce")
                    .queryParam("quantity", quantity)
                    .buildAndExpand(productId)
                    .toUriString();

            restTemplate.put(uri, null);
        } catch (RestClientException e) {
            log.error("Error calling product service to reduce stock", e);
            throw new RuntimeException("Failed to reduce stock", e);
        }
    }

    // ==================== WISHLIST METHODS ====================

    public com.cs308.gateway.model.product.Wishlist addToWishlist(Long userId, Long productId, String size) {
        log.debug("Calling product service: POST /wishlist/add - userId: {}, productId: {}, size: {}",
                userId, productId, size);

        try {
            var uriBuilder = UriComponentsBuilder.fromPath("/wishlist/add")
                    .queryParam("userId", userId)
                    .queryParam("productId", productId);

            if (size != null) {
                uriBuilder.queryParam("size", size);
            }

            String uri = uriBuilder.toUriString();

            com.cs308.gateway.model.product.Wishlist wishlist = restTemplate.postForObject(
                    uri, null, com.cs308.gateway.model.product.Wishlist.class);
            return wishlist;
        } catch (RestClientException e) {
            log.error("Error calling product service for add to wishlist", e);
            throw new RuntimeException("Failed to add item to wishlist", e);
        }
    }

    public com.cs308.gateway.model.product.Wishlist removeFromWishlist(Long userId, Long productId) {
        log.debug("Calling product service: DELETE /wishlist/remove - userId: {}, productId: {}",
                userId, productId);

        try {
            String uri = UriComponentsBuilder.fromPath("/wishlist/remove")
                    .queryParam("userId", userId)
                    .queryParam("productId", productId)
                    .toUriString();

            ResponseEntity<com.cs308.gateway.model.product.Wishlist> response = restTemplate.exchange(
                    uri,
                    HttpMethod.DELETE,
                    null,
                    com.cs308.gateway.model.product.Wishlist.class);

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service for remove from wishlist", e);
            throw new RuntimeException("Failed to remove item from wishlist", e);
        }
    }

    public com.cs308.gateway.model.product.Wishlist getWishlist(Long userId) {
        log.debug("Calling product service: GET /wishlist for userId: {}", userId);

        try {
            String uri = UriComponentsBuilder.fromPath("/wishlist")
                    .queryParam("userId", userId)
                    .toUriString();

            com.cs308.gateway.model.product.Wishlist wishlist = restTemplate.getForObject(
                    uri, com.cs308.gateway.model.product.Wishlist.class);
            return wishlist;
        } catch (RestClientException e) {
            log.error("Error calling product service for get wishlist", e);
            throw new RuntimeException("Failed to fetch wishlist", e);
        }
    }

    // ==================== PRODUCT MANAGEMENT METHODS ====================

    public Product addProduct(com.cs308.gateway.model.product.CreateProductRequest request) {
        log.debug("Calling product service: POST /products");

        try {
            ResponseEntity<Product> response = restTemplate.postForEntity(
                    "/products",
                    request,
                    Product.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service to add product", e);
            throw new RuntimeException("Failed to add product", e);
        }
    }

    public Product updateProduct(Long id, com.cs308.gateway.model.product.ProductUpdateRequest request) {
        log.debug("Calling product service: PUT /products/{}", id);

        try {
            ResponseEntity<Product> response = restTemplate.exchange(
                    "/products/{id}",
                    HttpMethod.PUT,
                    new org.springframework.http.HttpEntity<>(request),
                    Product.class,
                    id);
            return response.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("Product not found with id: {}", id);
            return null;
        } catch (RestClientException e) {
            log.error("Error calling product service to update product id: {}", id, e);
            throw new RuntimeException("Failed to update product", e);
        }
    }

    public void deleteProduct(Long id) {
        log.debug("Calling product service: DELETE /products/{}", id);

        try {
            restTemplate.exchange(
                    "/products/{id}",
                    HttpMethod.DELETE,
                    null,
                    Void.class,
                    id);
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("Product not found with id: {}", id);
            throw new RuntimeException("Product not found", e);
        } catch (RestClientException e) {
            log.error("Error calling product service to delete product id: {}", id, e);
            throw new RuntimeException("Failed to delete product", e);
        }
    }

    public Product updateStock(Long id, Integer quantity) {
        log.debug("Calling product service: PUT /products/{} with stock {}", id, quantity);

        try {
            com.cs308.gateway.model.product.ProductUpdateRequest request = com.cs308.gateway.model.product.ProductUpdateRequest
                    .builder()
                    .stock(quantity)
                    .build();

            ResponseEntity<Product> response = restTemplate.exchange(
                    "/products/{id}",
                    HttpMethod.PUT,
                    new org.springframework.http.HttpEntity<>(request),
                    Product.class,
                    id);
            return response.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("Product not found with id: {}", id);
            return null;
        } catch (RestClientException e) {
            log.error("Error calling product service to update stock for id: {}", id, e);
            throw new RuntimeException("Failed to update stock", e);
        }
    }

    public String uploadImage(byte[] fileBytes, String filename, String contentType) {
        log.debug("Calling product service: POST /images/upload");

        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);

            org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();

            // Create a resource from the byte array
            org.springframework.core.io.ByteArrayResource fileResource = new org.springframework.core.io.ByteArrayResource(
                    fileBytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };

            org.springframework.http.HttpHeaders fileHeaders = new org.springframework.http.HttpHeaders();
            fileHeaders.setContentType(org.springframework.http.MediaType.parseMediaType(contentType));
            org.springframework.http.HttpEntity<org.springframework.core.io.ByteArrayResource> filePart = new org.springframework.http.HttpEntity<>(
                    fileResource, fileHeaders);

            body.add("file", filePart);

            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(
                    body, headers);

            ResponseEntity<java.util.Map> response = restTemplate.postForEntity(
                    "/images/upload",
                    requestEntity,
                    java.util.Map.class);

            java.util.Map<String, String> result = response.getBody();
            return result != null ? result.get("url") : null;
        } catch (RestClientException e) {
            log.error("Error uploading image to product service", e);
            throw new RuntimeException("Failed to upload image", e);
        }
    }
}
