package com.codingapp.autonextauthenticationapi.service;

import com.codingapp.autonextauthenticationapi.domain.Product;
import com.codingapp.autonextauthenticationapi.domain.enums.*;
import com.codingapp.autonextauthenticationapi.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    /**
     * Ana listeleme + filtreleme metodu.
     */
    public List<Product> listProducts(
            String q,
            ProductType productType,
            TargetAudience targetAudience,
            Season season,
            Fit fit,
            WarrantyStatus warrantyStatus,
            Boolean active,
            String sort
    ) {
        List<Product> products = productRepository.search(
                normalize(q),
                productType,
                targetAudience,
                season,
                fit,
                warrantyStatus,
                active
        );

        return applySorting(products, sort);
    }

    /**
     * Detay endpoint'i için: id ile tek ürün getir.
     */
    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    private String normalize(String q) {
        if (q == null || q.isBlank()) {
            return null;
        }
        return q.trim();
    }

    /**
     * Şimdilik sort'u Java tarafında yapıyoruz.
     * İleride istersen Pageable + Sort ile DB'ye taşıyabilirsin.
     */
    private List<Product> applySorting(List<Product> products, String sort) {
        if (sort == null || sort.isBlank()) {
            return products; // default: DB'den gelen sıra (genelde id)
        }

        Comparator<Product> comparator = switch (sort) {
            case "nameAsc" ->
                    Comparator.comparing(Product::getName, String.CASE_INSENSITIVE_ORDER);
            case "nameDesc" ->
                    Comparator.comparing(Product::getName, String.CASE_INSENSITIVE_ORDER).reversed();
            case "newest" ->
                    Comparator.comparing(
                            (Product p) -> Optional.ofNullable(p.getCreatedAt()).orElse(null),
                            Comparator.nullsLast(Comparator.naturalOrder())
                    ).reversed();
            case "oldest" ->
                    Comparator.comparing(
                            (Product p) -> Optional.ofNullable(p.getCreatedAt()).orElse(null),
                            Comparator.nullsLast(Comparator.naturalOrder())
                    );
            default -> null;
        };

        if (comparator == null) {
            return products;
        }

        return products.stream()
                .sorted(comparator)
                .toList();
    }
}