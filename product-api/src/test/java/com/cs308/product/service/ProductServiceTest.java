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

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProductServiceTest {

    @Mock
    private ProductRepository repository;

    @InjectMocks
    private ProductService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void deleteRemovesExistingProduct() {
        service.delete(42L);
        verify(repository).deleteById(42L);
    }

    @Test
    void restoreStockIncreasesQuantity() {
        Product product = sampleProduct(10L);
        product.setStock(5);

        when(repository.findById(10L)).thenReturn(Optional.of(product));
        when(repository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

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
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

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
        when(repository.findById(123L)).thenReturn(Optional.empty());

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

    @Test
    void addProductSavesImages() {
        com.cs308.product.model.CreateProductRequest request = new com.cs308.product.model.CreateProductRequest();
        request.setName("Image Product");
        request.setPrice(100.0);
        request.setStock(10);
        request.setModel("IMG-001");
        request.setSerialNumber("IMG-SER-001");
        request.setDescription("Desc");
        request.setBrand("Brand");
        request.setProductType(ProductType.JACKET);
        request.setTargetAudience(TargetAudience.UNISEX);
        request.setWarrantyStatus(WarrantyStatus.STANDARD);
        request.setDistributorInfo("Dist Info");
        request.setImageUrls(java.util.List.of("http://img1.com", "http://img2.com"));

        when(repository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Product saved = service.addProduct(request);

        assertEquals(2, saved.getImages().size());
        assertEquals("http://img1.com", saved.getImages().get(0).getUrl());
        assertEquals(saved, saved.getImages().get(0).getProduct());
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
