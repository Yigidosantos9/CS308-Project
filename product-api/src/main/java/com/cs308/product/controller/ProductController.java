package com.cs308.product.controller;

import com.cs308.product.domain.Product;
import com.cs308.product.model.CreateProductRequest;
import com.cs308.product.model.ProductFilterRequest;
import com.cs308.product.model.ProductUpdateRequest;
import com.cs308.product.model.StockRestoreRequest;
import com.cs308.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody CreateProductRequest request) {
        Product created = service.addProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/restore-stock")
    public ResponseEntity<Product> restoreStock(@RequestBody @Valid StockRestoreRequest request) {
        Product updated = service.restoreStock(request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
            @RequestBody ProductUpdateRequest request) {
        Product updated = service.updateProduct(id, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    public List<Product> listProducts(@ModelAttribute ProductFilterRequest filter) {
        return service.search(filter);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
