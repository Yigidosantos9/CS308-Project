package com.cs308.product.service;

import com.cs308.product.model.Product;
import com.cs308.product.repo.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;

    public List<Product> getAll(String q) {
        if (q == null || q.isBlank()) return repo.findAll();
        return repo.search(q);
    }

    public Product getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
    }
}
