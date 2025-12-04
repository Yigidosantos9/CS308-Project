package com.cs308.product.controller;

import com.cs308.product.domain.Product;
import com.cs308.product.domain.enums.ProductType;
import com.cs308.product.domain.enums.TargetAudience;
import com.cs308.product.domain.enums.WarrantyStatus;
import com.cs308.product.model.ProductUpdateRequest;
import com.cs308.product.service.ProductNotFoundException;
import com.cs308.product.service.ProductService;
import com.cs308.product.web.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@Import(GlobalExceptionHandler.class)
class ProductControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockBean
        private ProductService productService;

        @Autowired
        private ObjectMapper objectMapper;

        @Test
        void addProductReturnsCreatedProduct() throws Exception {
                com.cs308.product.model.CreateProductRequest request = new com.cs308.product.model.CreateProductRequest();
                request.setName("Leather Jacket");
                request.setPrice(199.99);
                request.setStock(5);
                request.setModel("LJ-01");
                request.setSerialNumber("SER-123");
                request.setDescription("Premium leather jacket");
                request.setBrand("CS308");
                request.setProductType(ProductType.JACKET);
                request.setTargetAudience(TargetAudience.UNISEX);
                request.setWarrantyStatus(WarrantyStatus.STANDARD);
                request.setDistributorInfo("CS308 Dist");

                Product saved = Product.builder()
                                .id(10L)
                                .name(request.getName())
                                .price(request.getPrice())
                                .stock(request.getStock())
                                .model(request.getModel())
                                .serialNumber(request.getSerialNumber())
                                .description(request.getDescription())
                                .brand(request.getBrand())
                                .productType(request.getProductType())
                                .targetAudience(request.getTargetAudience())
                                .warrantyStatus(request.getWarrantyStatus())
                                .distributorInfo(request.getDistributorInfo())
                                .build();

                when(productService.addProduct(any(com.cs308.product.model.CreateProductRequest.class)))
                                .thenReturn(saved);

                mockMvc.perform(post("/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(10L))
                                .andExpect(jsonPath("$.name").value("Leather Jacket"));

                verify(productService).addProduct(any(com.cs308.product.model.CreateProductRequest.class));
        }

        @Test
        void updateProductReturnsUpdatedEntity() throws Exception {
                ProductUpdateRequest request = ProductUpdateRequest.builder()
                                .name("Updated Jacket")
                                .price(149.99)
                                .stock(7)
                                .model("JK-002")
                                .serialNumber("SER-456")
                                .description("Updated desc")
                                .productType(ProductType.JACKET)
                                .targetAudience(TargetAudience.UNISEX)
                                .warrantyStatus(WarrantyStatus.STANDARD)
                                .distributorInfo("CS308 Dist")
                                .build();

                Product updated = Product.builder()
                                .id(15L)
                                .name(request.getName())
                                .price(request.getPrice())
                                .stock(request.getStock())
                                .model(request.getModel())
                                .serialNumber(request.getSerialNumber())
                                .description(request.getDescription())
                                .brand(request.getBrand())
                                .productType(request.getProductType())
                                .targetAudience(request.getTargetAudience())
                                .warrantyStatus(request.getWarrantyStatus())
                                .distributorInfo(request.getDistributorInfo())
                                .build();

                when(productService.updateProduct(eq(15L), any(ProductUpdateRequest.class))).thenReturn(updated);

                mockMvc.perform(put("/products/{id}", 15L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(15L))
                                .andExpect(jsonPath("$.name").value("Updated Jacket"));

                verify(productService).updateProduct(eq(15L), any(ProductUpdateRequest.class));
        }

        @Test
        void deleteProductReturnsNoContent() throws Exception {
                doNothing().when(productService).delete(10L);

                mockMvc.perform(delete("/products/{id}", 10L))
                                .andExpect(status().isNoContent());

                verify(productService).delete(10L);
        }

        @Test
        void deleteProductReturnsNotFoundWhenServiceThrows() throws Exception {
                doThrow(new ProductNotFoundException(55L)).when(productService).delete(55L);

                mockMvc.perform(delete("/products/{id}", 55L))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.error").value("not_found"));
        }
}
