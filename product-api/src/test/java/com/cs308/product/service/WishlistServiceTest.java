package com.cs308.product.service;

import com.cs308.product.domain.Product;
import com.cs308.product.domain.Wishlist;
import com.cs308.product.domain.WishlistItem;
import com.cs308.product.repository.ProductRepository;
import com.cs308.product.repository.WishlistRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WishlistServiceTest {

    @Mock
    private WishlistRepository wishlistRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private WishlistService wishlistService;

    private Product buildProduct(Long id, double price) {
        Product p = new Product();
        p.setId(id);
        p.setPrice(price);
        p.setStock(10);
        return p;
    }

    private Wishlist buildEmptyWishlist(Long userId) {
        Wishlist wishlist = new Wishlist();
        wishlist.setId(1L);
        wishlist.setUserId(userId);
        wishlist.setItems(new ArrayList<>());
        return wishlist;
    }

    private WishlistItem buildWishlistItem(Wishlist wishlist, Product product) {
        WishlistItem item = new WishlistItem();
        item.setId(1L);
        item.setWishlist(wishlist);
        item.setProduct(product);
        return item;
    }

    @Test
    void addToWishlist_shouldCreateNewWishlistAndAddItem_whenUserHasNoWishlist() {
        // GIVEN
        Long userId = 10L;
        Long productId = 5L;

        Product product = buildProduct(productId, 100.0);

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(wishlistRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(wishlistRepository.save(any(Wishlist.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        Wishlist result = wishlistService.addToWishlist(userId, productId);

        // THEN
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(1, result.getItems().size());

        WishlistItem item = result.getItems().get(0);
        assertEquals(productId, item.getProduct().getId());

        verify(productRepository).findById(productId);
        verify(wishlistRepository).findByUserId(userId);
    }

    @Test
    void addToWishlist_shouldThrow_whenProductAlreadyInWishlist() {
        // GIVEN
        Long userId = 10L;
        Long productId = 5L;

        Product product = buildProduct(productId, 50.0);

        Wishlist wishlist = buildEmptyWishlist(userId);
        WishlistItem existingItem = buildWishlistItem(wishlist, product);
        wishlist.setItems(new ArrayList<>(List.of(existingItem)));

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(wishlistRepository.findByUserId(userId)).thenReturn(Optional.of(wishlist));

        // WHEN - THEN
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> wishlistService.addToWishlist(userId, productId));

        assertTrue(ex.getMessage().toLowerCase().contains("already"));

        verify(productRepository).findById(productId);
        verify(wishlistRepository).findByUserId(userId);
    }

    @Test
    void addToWishlist_shouldThrow_whenProductNotFound() {
        // GIVEN
        Long userId = 10L;
        Long productId = 99L;

        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        // WHEN - THEN
        assertThrows(ProductNotFoundException.class,
                () -> wishlistService.addToWishlist(userId, productId));

        verify(productRepository).findById(productId);
    }

    @Test
    void removeFromWishlist_shouldRemoveItem() {
        // GIVEN
        Long userId = 10L;
        Long productId = 5L;

        Product productToRemove = buildProduct(productId, 50.0);
        Product remainingProduct = buildProduct(6L, 20.0);

        Wishlist wishlist = buildEmptyWishlist(userId);
        WishlistItem itemToRemove = buildWishlistItem(wishlist, productToRemove);
        WishlistItem otherItem = buildWishlistItem(wishlist, remainingProduct);
        wishlist.setItems(new ArrayList<>(List.of(itemToRemove, otherItem)));

        when(wishlistRepository.findByUserId(userId)).thenReturn(Optional.of(wishlist));
        when(wishlistRepository.save(any(Wishlist.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        Wishlist result = wishlistService.removeFromWishlist(userId, productId);

        // THEN
        assertEquals(1, result.getItems().size());
        assertEquals(remainingProduct.getId(), result.getItems().get(0).getProduct().getId());

        verify(wishlistRepository).findByUserId(userId);
    }

    @Test
    void removeFromWishlist_shouldThrow_whenWishlistDoesNotExist() {
        // GIVEN
        Long userId = 10L;
        when(wishlistRepository.findByUserId(userId)).thenReturn(Optional.empty());

        // WHEN - THEN
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> wishlistService.removeFromWishlist(userId, 1L));

        assertTrue(ex.getMessage().toLowerCase().contains("wishlist"));
        verify(wishlistRepository).findByUserId(userId);
    }

    @Test
    void removeFromWishlist_shouldThrow_whenItemNotInWishlist() {
        // GIVEN
        Long userId = 10L;
        Wishlist wishlist = buildEmptyWishlist(userId);
        when(wishlistRepository.findByUserId(userId)).thenReturn(Optional.of(wishlist));

        // WHEN - THEN
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> wishlistService.removeFromWishlist(userId, 99L));

        assertTrue(ex.getMessage().toLowerCase().contains("product"));
        verify(wishlistRepository).findByUserId(userId);
    }

    @Test
    void getWishlist_shouldReturnWishlist_whenWishlistExists() {
        // GIVEN
        Long userId = 10L;
        Wishlist wishlist = buildEmptyWishlist(userId);

        when(wishlistRepository.findByUserId(userId)).thenReturn(Optional.of(wishlist));

        // WHEN
        Wishlist result = wishlistService.getWishlist(userId);

        // THEN
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        verify(wishlistRepository).findByUserId(userId);
    }

    @Test
    void getWishlist_shouldReturnEmptyWishlist_whenWishlistDoesNotExist() {
        // GIVEN
        Long userId = 10L;
        when(wishlistRepository.findByUserId(userId)).thenReturn(Optional.empty());

        // WHEN
        Wishlist result = wishlistService.getWishlist(userId);

        // THEN
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertTrue(result.getItems().isEmpty());
        verify(wishlistRepository).findByUserId(userId);
    }
}
