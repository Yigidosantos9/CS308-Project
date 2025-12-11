package com.cs308.product.service;

import com.cs308.product.domain.Product;
import com.cs308.product.domain.ProductImage;
import com.cs308.product.model.ProductFilterRequest;
import com.cs308.product.model.ProductUpdateRequest;
import com.cs308.product.model.StockRestoreRequest;
import com.cs308.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Product addProduct(com.cs308.product.model.CreateProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setModel(request.getModel());
        product.setSerialNumber(request.getSerialNumber());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand());
        product.setProductType(request.getProductType());
        product.setTargetAudience(request.getTargetAudience());
        product.setWarrantyStatus(request.getWarrantyStatus());
        product.setDistributorInfo(request.getDistributorInfo());
        product.setSeason(request.getSeason());
        product.setFit(request.getFit());
        product.setMaterial(request.getMaterial());
        product.setCareInstructions(request.getCareInstructions());
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<ProductImage> images = request.getImageUrls().stream()
                    .map(url -> ProductImage.builder()
                            .url(url)
                            .product(product)
                            .build())
                    .toList();
            product.getImages().addAll(images);
        }

        return productRepository.save(product);
    }

    public Product restoreStock(StockRestoreRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(request.getProductId()));

        Integer current = product.getStock() == null ? 0 : product.getStock();
        product.setStock(current + request.getQuantity());

        return productRepository.save(product);
    }

    public Product reduceStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        Integer currentStock = product.getStock() == null ? 0 : product.getStock();
        if (currentStock < quantity) {
            throw new IllegalArgumentException("Insufficient stock for product: " + productId);
        }

        product.setStock(currentStock - quantity);

        // Increment sales count for popularity sorting
        Integer currentSales = product.getSalesCount() == null ? 0 : product.getSalesCount();
        product.setSalesCount(currentSales + quantity);

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductUpdateRequest request) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        applyUpdates(existing, request);
        return productRepository.save(existing);
    }

    private void applyUpdates(Product target, ProductUpdateRequest request) {
        if (request.getName() != null) {
            target.setName(request.getName());
        }
        if (request.getPrice() != null) {
            target.setPrice(request.getPrice());
        }
        if (request.getStock() != null) {
            target.setStock(request.getStock());
        }
        if (request.getModel() != null) {
            target.setModel(request.getModel());
        }
        if (request.getSerialNumber() != null) {
            target.setSerialNumber(request.getSerialNumber());
        }
        if (request.getDescription() != null) {
            target.setDescription(request.getDescription());
        }
        if (request.getBrand() != null) {
            target.setBrand(request.getBrand());
        }
        if (request.getProductType() != null) {
            target.setProductType(request.getProductType());
        }
        if (request.getTargetAudience() != null) {
            target.setTargetAudience(request.getTargetAudience());
        }
        if (request.getWarrantyStatus() != null) {
            target.setWarrantyStatus(request.getWarrantyStatus());
        }
        if (request.getDistributorInfo() != null) {
            target.setDistributorInfo(request.getDistributorInfo());
        }
        if (request.getSeason() != null) {
            target.setSeason(request.getSeason());
        }
        if (request.getFit() != null) {
            target.setFit(request.getFit());
        }
        if (request.getMaterial() != null) {
            target.setMaterial(request.getMaterial());
        }
        if (request.getCareInstructions() != null) {
            target.setCareInstructions(request.getCareInstructions());
        }
        if (request.getActive() != null) {
            target.setActive(request.getActive());
        }
        if (request.getImageUrls() != null) {
            target.getImages().clear();
            if (!request.getImageUrls().isEmpty()) {
                List<ProductImage> newImages = request.getImageUrls().stream()
                        .map(url -> ProductImage.builder()
                                .url(url)
                                .product(target)
                                .build())
                        .toList();
                target.getImages().addAll(newImages);
            }
        }
    }

    /**
     * getAll(): returns products sorted alphabetically by name (A–Z)
     */
    public List<Product> getAll() {
        return productRepository.findAll(
                Sort.by(Sort.Direction.ASC, "name"));
    }

    public Optional<Product> getById(Long id) {
        return productRepository.findById(id);
    }

    /**
     * search(): applies filters and sorts.
     * - Default sort (including "relevance") = Name A–Z.
     * - "ratingDesc"/"ratingAsc" use custom ORDER BY that handles unrated products.
     */
    public List<Product> search(ProductFilterRequest filter) {
        // No filter object at all => just return all sorted A–Z
        if (filter == null) {
            return productRepository.findAll(
                    Sort.by(Sort.Direction.ASC, "name"));
        }

        // If sort is missing/blank, treat it as nameAsc
        String sortParam = (filter.getSort() == null || filter.getSort().isBlank())
                ? "nameAsc"
                : filter.getSort();

        // Resolve enums from filter
        com.cs308.product.domain.enums.ProductType productType = null;
        if (filter.getCategory() != null && !filter.getCategory().isBlank()) {
            try {
                productType = com.cs308.product.domain.enums.ProductType
                        .valueOf(filter.getCategory().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Unknown category -> no results
                return List.of();
            }
        }

        com.cs308.product.domain.enums.TargetAudience targetAudience = null;
        if (filter.getGender() != null && !filter.getGender().isBlank()) {
            try {
                targetAudience = com.cs308.product.domain.enums.TargetAudience
                        .valueOf(filter.getGender().toUpperCase());
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        }

        com.cs308.product.domain.enums.Color color = null;
        if (filter.getColor() != null && !filter.getColor().isBlank()) {
            try {
                color = com.cs308.product.domain.enums.Color
                        .valueOf(filter.getColor().toUpperCase());
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        }

        String qPattern = (filter.getQ() != null && !filter.getQ().isBlank())
                ? "%" + filter.getQ().toLowerCase() + "%"
                : null;

        String descriptionPattern = (filter.getDescription() != null && !filter.getDescription().isBlank())
                ? "%" + filter.getDescription().toLowerCase() + "%"
                : null;

        // 🔥 Special handling for rating-based sorts:
        // - rated products first (reviewCount > 0)
        // - then unrated products (reviewCount == 0)
        // - among rated: order by averageRating & reviewCount
        if ("ratingDesc".equalsIgnoreCase(sortParam)) {
            // Highest rated → lowest, unrated last
            return productRepository.searchOrderByRatingDesc(
                    qPattern,
                    productType,
                    targetAudience,
                    color,
                    descriptionPattern);
        } else if ("ratingAsc".equalsIgnoreCase(sortParam)) {
            // Lowest rated → highest, unrated last
            return productRepository.searchOrderByRatingAsc(
                    qPattern,
                    productType,
                    targetAudience,
                    color,
                    descriptionPattern);
        }

        // --- All other sorts use the generic search() + Sort ---

        Sort sort;

        if ("priceAsc".equalsIgnoreCase(sortParam)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("priceDesc".equalsIgnoreCase(sortParam)) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        } else if ("newest".equalsIgnoreCase(sortParam)) {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        } else if ("popularity".equalsIgnoreCase(sortParam)) {
            sort = Sort.by(Sort.Direction.DESC, "salesCount");
        } else if ("nameAsc".equalsIgnoreCase(sortParam) || "relevance".equalsIgnoreCase(sortParam)) {
            // A–Z (also used for "relevance")
            sort = Sort.by(Sort.Direction.ASC, "name");
        } else if ("nameDesc".equalsIgnoreCase(sortParam)) {
            // Z–A
            sort = Sort.by(Sort.Direction.DESC, "name");
        } else {
            // Any unknown sort => fallback to A–Z
            sort = Sort.by(Sort.Direction.ASC, "name");
        }

        return productRepository.search(
                qPattern,
                productType,
                targetAudience,
                color,
                descriptionPattern,
                sort);
    }

    public void delete(Long id) {
        productRepository.deleteById(id);
    }
}
