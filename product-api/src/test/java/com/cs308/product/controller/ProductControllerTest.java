package com.cs308.product.controller;

import com.cs308.product.service.ProductNotFoundException;
import com.cs308.product.service.ProductService;
import com.cs308.product.web.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@Import(GlobalExceptionHandler.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

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
