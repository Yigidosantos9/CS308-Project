package com.cs308.gateway.controller;

import com.cs308.gateway.model.auth.enums.UserType;
import com.cs308.gateway.model.product.CreateProductRequest;
import com.cs308.gateway.model.product.Product;
import com.cs308.gateway.model.product.ProductFilterRequest;
import com.cs308.gateway.model.product.ProductUpdateRequest;
import com.cs308.gateway.security.RequiresRole;
import com.cs308.gateway.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // Anyone can browse products (no authentication required for browsing)
    @GetMapping
    public ResponseEntity<List<Product>> listProducts(
            @ModelAttribute ProductFilterRequest filter) {
        log.info("BFF: List products request received with filter: {}", filter);

        try {
            List<Product> products = productService.listProducts(filter);
            return ResponseEntity.ok(products);
        } catch (RuntimeException e) {
            log.error("Error processing list products request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Anyone can view product details
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        log.info("BFF: Get product request received for id: {}", id);

        try {
            Product product = productService.getProduct(id);
            if (product != null) {
                return ResponseEntity.ok(product);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            log.error("Error processing get product request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Product Manager only - Add product
    @PostMapping
    @RequiresRole({ UserType.PRODUCT_MANAGER })
    public ResponseEntity<Product> addProduct(@Valid @RequestBody CreateProductRequest request) {
        log.info("BFF: Add product request received - name: {}", request.getName());

        try {
            Product created = productService.addProduct(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            log.error("Error processing add product request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Product Manager only - Update product
    @PutMapping("/{id}")
    @RequiresRole({ UserType.PRODUCT_MANAGER })
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {
        log.info("BFF: Update product request received for id: {}", id);

        try {
            Product updated = productService.updateProduct(id, request);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            log.error("Error processing update product request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Product Manager only - Delete product
    @DeleteMapping("/{id}")
    @RequiresRole({ UserType.PRODUCT_MANAGER })
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        log.info("BFF: Delete product request received for id: {}", id);

        try {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error processing delete product request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Product Manager only - Manage stock
    @PutMapping("/{id}/stock")
    @RequiresRole({ UserType.PRODUCT_MANAGER })
    public ResponseEntity<Product> updateStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        log.info("BFF: Update stock request received for product id: {}, quantity: {}", id, quantity);

        try {
            Product updated = productService.updateStock(id, quantity);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            log.warn("Invalid stock update request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            log.error("Error processing update stock request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== CATEGORY MANAGEMENT ====================

    // Anyone can view categories
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        log.info("BFF: Get categories request");
        try {
            java.util.List<?> categories = productService.getCategories();
            return ResponseEntity.ok(categories);
        } catch (RuntimeException e) {
            log.error("Error fetching categories", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Product Manager only - Add category
    @PostMapping("/categories")
    @RequiresRole({ UserType.PRODUCT_MANAGER })
    public ResponseEntity<?> addCategory(@RequestBody java.util.Map<String, String> request) {
        String name = request.get("name");
        log.info("BFF: Add category request - name: {}", name);
        try {
            Object result = productService.addCategory(name);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("Error adding category", e);
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Product Manager only - Delete category
    @DeleteMapping("/categories/{id}")
    @RequiresRole({ UserType.PRODUCT_MANAGER })
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        log.info("BFF: Delete category request - id: {}", id);
        try {
            productService.deleteCategory(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Category deleted"));
        } catch (RuntimeException e) {
            log.error("Error deleting category", e);
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Image upload is handled by direct gateway route to product-api
    // See application.yml: product-images route
}
