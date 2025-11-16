package com.cs308.gateway.controller;

import com.cs308.gateway.model.auth.enums.UserType;
import com.cs308.gateway.model.product.Product;
import com.cs308.gateway.model.product.ProductFilterRequest;
import com.cs308.gateway.security.RequiresRole;
import com.cs308.gateway.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    @RequiresRole({UserType.PRODUCT_MANAGER})
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        log.info("BFF: Add product request received");
        // TODO: Implement add product in service
        return ResponseEntity.ok().build();
    }

    // Product Manager only - Update product
    @PutMapping("/{id}")
    @RequiresRole({UserType.PRODUCT_MANAGER})
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        log.info("BFF: Update product request received for id: {}", id);
        // TODO: Implement update product in service
        return ResponseEntity.ok().build();
    }

    // Product Manager only - Delete product
    @DeleteMapping("/{id}")
    @RequiresRole({UserType.PRODUCT_MANAGER})
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        log.info("BFF: Delete product request received for id: {}", id);
        // TODO: Implement delete product in service
        return ResponseEntity.ok().build();
    }

    // Product Manager only - Manage stock
    @PutMapping("/{id}/stock")
    @RequiresRole({UserType.PRODUCT_MANAGER})
    public ResponseEntity<Product> updateStock(@PathVariable Long id, @RequestParam Integer quantity) {
        log.info("BFF: Update stock request received for product id: {}, quantity: {}", id, quantity);
        // TODO: Implement update stock in service
        return ResponseEntity.ok().build();
    }
}

