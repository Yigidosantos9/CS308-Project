package com.cs308.product.web;

import com.cs308.product.model.Product;
import com.cs308.product.model.ProductFilterRequest;
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
}