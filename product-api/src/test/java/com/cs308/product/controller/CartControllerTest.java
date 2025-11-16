package com.cs308.product.controller;

import com.cs308.product.domain.Cart;
import com.cs308.product.service.CartService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebMvcTest(CartController.class)
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CartService cartService;

    private Cart buildCart(Long userId) {
        Cart cart = new Cart();
        cart.setId(1L);
        cart.setUserId(userId);
        cart.setItems(new ArrayList<>());
        cart.setTotalPrice(0.0);
        cart.setTotalQuantity(0);
        return cart;
    }

    @Test
    void addToCart_shouldCallServiceAndReturnOk() throws Exception {
        // GIVEN
        Long userId = 10L;
        Long productId = 5L;
        int qty = 2;

        Cart cart = buildCart(userId);

        when(cartService.addToCart(eq(userId), eq(productId), eq(qty)))
                .thenReturn(cart);

        // WHEN - THEN
        mockMvc.perform(post("/api/cart/add")
                        .param("userId", String.valueOf(userId))
                        .param("productId", String.valueOf(productId))
                        .param("qty", String.valueOf(qty)))
                .andExpect(status().isOk());

        Mockito.verify(cartService, times(1))
                .addToCart(userId, productId, qty);
    }

    @Test
    void getCart_shouldCallServiceAndReturnOk() throws Exception {
        // GIVEN
        Long userId = 10L;
        Cart cart = buildCart(userId);

        when(cartService.getCart(eq(userId))).thenReturn(cart);

        // WHEN - THEN
        mockMvc.perform(get("/api/cart")
                        .param("userId", String.valueOf(userId)))
                .andExpect(status().isOk());

        Mockito.verify(cartService, times(1))
                .getCart(userId);
    }


}