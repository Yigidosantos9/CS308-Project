package com.cs308.product.web;

import com.cs308.product.model.Product;
import com.cs308.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/products", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Validated
public class ProductController {

    private final ProductService service;

    // GET /products?q=phone
    @GetMapping
    public List<Product> getProducts(@RequestParam(name = "q", required = false) String query) {
        return service.getAll(query);
    }

    // GET /products/{id}
    @GetMapping("/{id}")
    public Product getProduct(@PathVariable("id") Long id) {
        return service.getById(id);
    }
}
