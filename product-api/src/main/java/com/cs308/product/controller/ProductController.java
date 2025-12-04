package com.cs308.product.controller;

import com.cs308.product.domain.Comment;
import com.cs308.product.domain.Product;
import com.cs308.product.model.CreateProductRequest;
import com.cs308.product.model.ProductFilterRequest;
import com.cs308.product.model.ProductUpdateRequest;
import com.cs308.product.service.CommentService;
import com.cs308.product.service.ProductService;
import com.cs308.product.service.RatingService;
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

    private final ProductService productService;
    private final CommentService commentService;
    private final RatingService ratingService;

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getApprovedComments(id));
    }

    @GetMapping("/{id}/rating")
    public ResponseEntity<Double> getRating(@PathVariable Long id) {
        return ResponseEntity.ok(ratingService.getAverageRating(id));
    }

    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody CreateProductRequest request) {
        Product created = productService.addProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
            @RequestBody ProductUpdateRequest request) {
        Product updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    public List<Product> listProducts(@ModelAttribute ProductFilterRequest filter) {
        return productService.search(filter);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return productService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
