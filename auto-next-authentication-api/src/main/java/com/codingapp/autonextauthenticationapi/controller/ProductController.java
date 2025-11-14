package com.codingapp.autonextauthenticationapi.controller;

import com.codingapp.autonextauthenticationapi.domain.Product;
import com.codingapp.autonextauthenticationapi.domain.enums.*;
import com.codingapp.autonextauthenticationapi.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * Listeleme + filtreleme endpoint'i.
     *
     * Örnek:
     *  GET /api/products?q=sweatshirt&productType=APPAREL&targetAudience=UNISEX&season=WINTER&sort=newest
     */
    @GetMapping
    public List<Product> listProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) ProductType productType,
            @RequestParam(required = false) TargetAudience targetAudience,
            @RequestParam(required = false) Season season,
            @RequestParam(required = false) Fit fit,
            @RequestParam(required = false) WarrantyStatus warrantyStatus,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false, defaultValue = "newest") String sort
    ) {
        return productService.listProducts(
                q,
                productType,
                targetAudience,
                season,
                fit,
                warrantyStatus,
                active,
                sort
        );
    }

    /**
     * Detay endpoint'i.
     *
     * Örnek:
     *  GET /api/products/42
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        Product product = productService.getById(id);
        return ResponseEntity.ok(product);
    }
}