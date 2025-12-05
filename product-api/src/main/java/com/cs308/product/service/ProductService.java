package com.cs308.product.service;

import com.cs308.product.domain.Product;
import com.cs308.product.model.ProductFilterRequest;
import com.cs308.product.model.ProductUpdateRequest;
import com.cs308.product.model.StockRestoreRequest;
import com.cs308.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
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
        return productRepository.save(product);
    }

    public Product restoreStock(StockRestoreRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(request.getProductId()));

        Integer current = product.getStock() == null ? 0 : product.getStock();
        product.setStock(current + request.getQuantity());

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

        String sortParam = (filter.getSort() == null || filter.getSort().isBlank())
                ? "relevance"
                : filter.getSort();

        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.unsorted();
        if ("priceAsc".equalsIgnoreCase(sortParam)) {
            sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "price");
        } else if ("priceDesc".equalsIgnoreCase(sortParam)) {
            sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,
                    "price");
        } else if ("newest".equalsIgnoreCase(sortParam)) {
            sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,
                    "createdAt");
        }

        com.cs308.product.domain.enums.ProductType productType = null;
        if (filter.getCategory() != null && !filter.getCategory().isBlank()) {
            try {
                productType = com.cs308.product.domain.enums.ProductType.valueOf(filter.getCategory().toUpperCase());
            } catch (IllegalArgumentException e) {
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
                color = com.cs308.product.domain.enums.Color.valueOf(filter.getColor().toUpperCase());
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
