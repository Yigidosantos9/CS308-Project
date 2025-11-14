package com.cs308.product.web;

import com.cs308.product.model.Product;
import com.cs308.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    // Liste + filtre + sort
    @GetMapping
    public List<Product> listProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String color,
            @RequestParam(required = false, defaultValue = "relevance") String sort
    ) {
        // service -> repo -> search zinciri
        return service.search(q, category, gender, color, sort);
    }

    // Detay
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}