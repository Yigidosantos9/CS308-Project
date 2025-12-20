package com.cs308.product.controller;

import com.cs308.product.domain.Wishlist;
import com.cs308.product.service.WishlistService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebMvcTest(WishlistController.class)
class WishlistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WishlistService wishlistService;

    private Wishlist buildWishlist(Long userId) {
        Wishlist wishlist = new Wishlist();
        wishlist.setId(1L);
        wishlist.setUserId(userId);
        wishlist.setItems(new ArrayList<>());
        return wishlist;
    }

    @Test
    void addToWishlist_shouldCallServiceAndReturnOk() throws Exception {
        // GIVEN
        Long userId = 10L;
        Long productId = 5L;

        Wishlist wishlist = buildWishlist(userId);

        when(wishlistService.addToWishlist(eq(userId), eq(productId)))
                .thenReturn(wishlist);

        // WHEN - THEN
        mockMvc.perform(post("/wishlist/add")
                .param("userId", String.valueOf(userId))
                .param("productId", String.valueOf(productId)))
                .andExpect(status().isOk());

        Mockito.verify(wishlistService, times(1))
                .addToWishlist(userId, productId);
    }

    @Test
    void removeFromWishlist_shouldCallServiceAndReturnOk() throws Exception {
        // GIVEN
        Long userId = 10L;
        Long productId = 5L;
        Wishlist wishlist = buildWishlist(userId);

        when(wishlistService.removeFromWishlist(eq(userId), eq(productId))).thenReturn(wishlist);

        // WHEN - THEN
        mockMvc.perform(delete("/wishlist/remove")
                .param("userId", String.valueOf(userId))
                .param("productId", String.valueOf(productId)))
                .andExpect(status().isOk());

        Mockito.verify(wishlistService, times(1))
                .removeFromWishlist(userId, productId);
    }

    @Test
    void getWishlist_shouldCallServiceAndReturnOk() throws Exception {
        // GIVEN
        Long userId = 10L;
        Wishlist wishlist = buildWishlist(userId);

        when(wishlistService.getWishlist(eq(userId))).thenReturn(wishlist);

        // WHEN - THEN
        mockMvc.perform(get("/wishlist")
                .param("userId", String.valueOf(userId)))
                .andExpect(status().isOk());

        Mockito.verify(wishlistService, times(1))
                .getWishlist(userId);
    }
}
