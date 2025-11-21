package com.cs308.product.service;

import com.cs308.product.domain.Product;
import com.cs308.product.model.ProductFilterRequest;
import com.cs308.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Optional<Product> getById(Long id) {
        return productRepository.findById(id);
    }


    public List<Product> search(ProductFilterRequest filter) {
        if (filter == null) {
            return productRepository.findAll();
        }

        String sort = (filter.getSort() == null || filter.getSort().isBlank())
                ? "relevance"
                : filter.getSort();

        return productRepository.search(
                filter.getQ(),
                filter.getCategory(),
                filter.getGender(),
                filter.getColor(),
                sort
        );
    }


    public List<Product> search(String q,
                                String category,
                                String gender,
                                String color,
                                String sort) {

        ProductFilterRequest filter = new ProductFilterRequest();
        filter.setQ(q);
        filter.setCategory(category);
        filter.setGender(gender);
        filter.setColor(color);
        filter.setSort(sort);

        return search(filter);
    }

    public void delete(Long id) {
        boolean removed = productRepository.deleteById(id);
        if (!removed) {
            throw new ProductNotFoundException(id);
        }
    }
}
