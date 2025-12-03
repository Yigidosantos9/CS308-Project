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

    public Product addProduct(Product product) {
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
