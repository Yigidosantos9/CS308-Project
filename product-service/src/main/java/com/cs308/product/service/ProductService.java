package com.cs308.product.service;

import com.cs308.product.model.Product;
import com.cs308.product.repo.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;

    public List<Product> getAll() {
        return repo.findAll();
    }

    public Optional<Product> getById(Long id) {
        return repo.findById(id);
    }

    /**
     * Full filtreli arama:
     * q       → isim/açıklama/marka içinde ara
     * category→ kategori filtresi
     * gender  → women/men/unisex
     * color   → renk
     * sort    → priceAsc / priceDesc / ratingDesc
     */
    public List<Product> search(String q,
                                String category,
                                String gender,
                                String color,
                                String sort) {

        return repo.search(q, category, gender, color, sort);
    }
}