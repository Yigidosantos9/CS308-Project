package com.cs308.product.repository;

import com.cs308.product.domain.Product;

import com.cs308.product.domain.enums.TargetAudience;
import com.cs308.product.domain.enums.WarrantyStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Sort;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Test
    public void testSearchWithNullParameters() {
        // Given
        Product product = new Product();
        product.setName("Test Product");
        product.setPrice(100.0);
        product.setStock(10);
        product.setModel("Model X");
        product.setSerialNumber("SN123");
        product.setDescription("Test Description");
        product.setBrand("Test Brand");
        product.setProductType("TSHIRT");
        product.setTargetAudience(TargetAudience.UNISEX);
        product.setWarrantyStatus(WarrantyStatus.STANDARD);
        product.setDistributorInfo("Distributor Info");
        product.setActive(true);
        productRepository.save(product);

        // When
        List<Product> results = productRepository.search(
                null,
                null,
                null,
                null,
                null,
                Sort.unsorted());

        // Then
        assertThat(results).isNotEmpty();
    }
}
