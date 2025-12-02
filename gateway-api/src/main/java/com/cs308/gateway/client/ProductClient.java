package com.cs308.gateway.client;

import com.cs308.gateway.model.product.Cart;
import com.cs308.gateway.model.product.Product;
import com.cs308.gateway.model.product.ProductFilterRequest;
import com.cs308.gateway.model.product.ProductPriceUpdateRequest;
import lombok.RequiredArgsConstructor;
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
                    new ParameterizedTypeReference<List<Product>>() {}
            );
            
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
                    id
            );
            return product;
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("Product not found with id: {}", id);
            return null;
        } catch (RestClientException e) {
            log.error("Error calling product service for product id: {}", id, e);
            throw new RuntimeException("Failed to fetch product", e);
        }
    }

    public Cart addToCart(Long userId, Long productId, Integer quantity) {
        log.debug("Calling product service: POST /cart/add - userId: {}, productId: {}, quantity: {}", 
                userId, productId, quantity);
        
        try {
            String uri = UriComponentsBuilder.fromPath("/cart/add")
                    .queryParam("userId", userId)
                    .queryParam("productId", productId)
                    .queryParam("quantity", quantity)
                    .toUriString();
            
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
                    productId
            );

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling product service to set price for id: {}", productId, e);
            throw new RuntimeException("Failed to set product price", e);
        }
    }
}
