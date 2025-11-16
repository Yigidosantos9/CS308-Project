package com.cs308.product.service;

import com.cs308.product.domain.Product;
import com.cs308.product.domain.enums.Fit;
import com.cs308.product.domain.enums.ProductType;
import com.cs308.product.domain.enums.Season;
import com.cs308.product.domain.enums.TargetAudience;
import com.cs308.product.domain.enums.WarrantyStatus;
import com.cs308.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProductServiceTest {

    private ProductRepository repository;
    private ProductService service;

    @BeforeEach
    void setUp() {
        repository = new ProductRepository();
        service = new ProductService(repository);
    }

    @Test
    void deleteRemovesExistingProduct() {
        Product product = sampleProduct(42L);
        repository.saveAll(List.of(product));

        service.delete(42L);

        assertTrue(repository.findById(42L).isEmpty(), "product should be removed from repository");
    }

    @Test
    void deleteThrowsWhenProductMissing() {
        assertThrows(ProductNotFoundException.class, () -> service.delete(99L));
    }

    private Product sampleProduct(Long id) {
        return Product.builder()
                .id(id)
                .name("Jacket")
                .price(199.99)
                .stock(10)
                .model("JK-001")
                .serialNumber("SERIAL-001")
                .description("Warm winter jacket")
                .brand("CS308")
                .productType(ProductType.JACKET)
                .targetAudience(TargetAudience.UNISEX)
                .warrantyStatus(WarrantyStatus.STANDARD)
                .distributorInfo("CS308 Distributors")
                .season(Season.WINTER)
                .fit(Fit.REGULAR)
                .material("Cotton")
                .careInstructions("Dry clean")
                .active(true)
                .build();
    }
}
