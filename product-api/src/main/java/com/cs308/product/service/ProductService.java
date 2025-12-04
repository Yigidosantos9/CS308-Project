package com.cs308.product.service;

import com.cs308.product.domain.Product;
import com.cs308.product.model.ProductFilterRequest;
import com.cs308.product.model.ProductUpdateRequest;
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

        String sort = (filter.getSort() == null || filter.getSort().isBlank())
                ? "relevance"
                : filter.getSort();

        return search(
                filter.getQ(),
                filter.getCategory(),
                filter.getGender(),
                filter.getColor(),
                filter.getDescription(),
                sort);
    }

    public List<Product> search(String q,
            String category,
            String gender,
            String color,
            String description,
            String sort) {

        return productRepository.findAll().stream()
                .filter(p -> {
                    if (q == null || q.isBlank())
                        return true;
                    String s = q.toLowerCase();
                    return (p.getName() != null && p.getName().toLowerCase().contains(s))
                            || (p.getDescription() != null && p.getDescription().toLowerCase().contains(s))
                            || (p.getBrand() != null && p.getBrand().toLowerCase().contains(s));
                })
                .filter(p -> category == null || category.isBlank()
                        || (p.getProductType() != null && p.getProductType().name().equalsIgnoreCase(category)))
                .filter(p -> gender == null || gender.isBlank()
                        || (p.getTargetAudience() != null && p.getTargetAudience().name().equalsIgnoreCase(gender)))
                .filter(p -> color == null || color.isBlank()) // Color is not in Product entity yet?
                .filter(p -> {
                    if (description == null || description.isBlank())
                        return true;
                    return p.getDescription() != null
                            && p.getDescription().toLowerCase().contains(description.toLowerCase());
                })
                .sorted(getComparator(sort))
                .collect(java.util.stream.Collectors.toList());
    }

    private java.util.Comparator<Product> getComparator(String sort) {
        if ("priceAsc".equalsIgnoreCase(sort)) {
            return java.util.Comparator.comparing(Product::getPrice,
                    java.util.Comparator.nullsLast(Double::compareTo));
        } else if ("priceDesc".equalsIgnoreCase(sort)) {
            return java.util.Comparator.comparing(Product::getPrice,
                    java.util.Comparator.nullsLast(Double::compareTo)).reversed();
        }
        return (p1, p2) -> 0;
    }

    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        productRepository.deleteById(id);
    }
}
