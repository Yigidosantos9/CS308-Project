package com.cs308.product.service;

import com.cs308.product.domain.Product;
import com.cs308.product.domain.enums.Fit;
import com.cs308.product.domain.enums.ProductType;
import com.cs308.product.domain.enums.Season;
import com.cs308.product.domain.enums.TargetAudience;
import com.cs308.product.domain.enums.WarrantyStatus;
import com.cs308.product.model.ProductUpdateRequest;
import com.cs308.product.model.StockRestoreRequest;
import com.cs308.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

    @Test
    void restoreStockIncreasesQuantity() {
        Product product = sampleProduct(10L);
        product.setStock(5);
        repository.saveAll(List.of(product));

        StockRestoreRequest request = StockRestoreRequest.builder()
                .productId(10L)
                .quantity(3)
                .build();

        Product updated = service.restoreStock(request);

        assertEquals(8, updated.getStock());
    }

    @Test
    void updateProductReplacesExistingProduct() {
        Product existing = sampleProduct(1L);
        repository.save(existing);

        ProductUpdateRequest updatedPayload = ProductUpdateRequest.builder()
                .name("Updated Jacket")
                .price(149.99)
                .stock(7)
                .model("JK-002")
                .serialNumber("SERIAL-002")
                .description("Updated description")
                .brand("CS308")
                .productType(existing.getProductType())
                .targetAudience(existing.getTargetAudience())
                .warrantyStatus(existing.getWarrantyStatus())
                .distributorInfo("New Distributor")
                .season(existing.getSeason())
                .fit(existing.getFit())
                .material("Wool")
                .careInstructions("Hand wash")
                .active(true)
                .build();

        Product result = service.updateProduct(1L, updatedPayload);

        assertEquals(1L, result.getId());
        assertEquals("Updated Jacket", result.getName());
        assertEquals(149.99, result.getPrice());
    }

    @Test
    void updateProductThrowsWhenMissing() {
        ProductUpdateRequest payload = ProductUpdateRequest.builder()
                .name("Anything")
                .price(10.0)
                .stock(1)
                .model("M")
                .serialNumber("S")
                .description("D")
                .distributorInfo("Dist")
                .active(true)
                .build();
        assertThrows(ProductNotFoundException.class, () -> service.updateProduct(123L, payload));
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
