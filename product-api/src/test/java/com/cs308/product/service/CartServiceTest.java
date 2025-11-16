package com.cs308.product.service;

import com.cs308.product.domain.Cart;
import com.cs308.product.domain.CartItem;
import com.cs308.product.domain.Product;
import com.cs308.product.repository.CartRepository;
import com.cs308.product.repository.ProductRepository;
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
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CartService cartService;

    private Product buildProduct(Long id, double price, int stock) {
        Product p = new Product();
        p.setId(id);
        p.setPrice(price);
        p.setStock(stock);
        return p;
    }

    private Cart buildEmptyCart(Long userId) {
        Cart cart = new Cart();
        cart.setId(1L);
        cart.setUserId(userId);
        cart.setItems(new ArrayList<>());
        cart.setTotalPrice(0.0);
        cart.setTotalQuantity(0);
        return cart;
    }

    private CartItem buildCartItem(Cart cart, Product product, int qty) {
        CartItem item = new CartItem();
        item.setId(1L);
        item.setCart(cart);
        item.setProduct(product);
        item.setQuantity(qty);
        return item;
    }

    @Test
    void addToCart_shouldCreateNewCartAndAddItem_whenUserHasNoCart() {
        // GIVEN
        Long userId = 10L;
        Long productId = 5L;
        int qty = 2;

        Product product = buildProduct(productId, 100.0, 10);

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        Cart result = cartService.addToCart(userId, productId, qty);

        // THEN
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(1, result.getItems().size());

        CartItem item = result.getItems().get(0);
        assertEquals(productId, item.getProduct().getId());
        assertEquals(qty, item.getQuantity());

        assertEquals(100.0 * qty, result.getTotalPrice());
        assertEquals(qty, result.getTotalQuantity());

        verify(productRepository).findById(productId);
        verify(cartRepository).findByUserId(userId);
    }

    @Test
    void addToCart_shouldIncreaseQuantity_whenItemAlreadyInCart() {
        // GIVEN
        Long userId = 10L;
        Long productId = 5L;

        Product product = buildProduct(productId, 50.0, 10);

        Cart cart = buildEmptyCart(userId);
        CartItem existingItem = buildCartItem(cart, product, 2);
        cart.setItems(new ArrayList<>(List.of(existingItem)));

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        int qtyToAdd = 3;

        // WHEN
        Cart result = cartService.addToCart(userId, productId, qtyToAdd);

        // THEN
        assertEquals(1, result.getItems().size());
        CartItem item = result.getItems().get(0);
        assertEquals(2 + qtyToAdd, item.getQuantity());

        assertEquals(50.0 * 5, result.getTotalPrice());
        assertEquals(5, result.getTotalQuantity());

        verify(productRepository).findById(productId);
        verify(cartRepository).findByUserId(userId);
    }

    @Test
    void addToCart_shouldThrowException_whenStockIsNotEnoughForNewItem() {
        // GIVEN
        Long userId = 10L;
        Long productId = 5L;

        Product product = buildProduct(productId, 50.0, 2);

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());

        // WHEN - THEN
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> cartService.addToCart(userId, productId, 3)); // 3 > stock

        assertTrue(ex.getMessage().toLowerCase().contains("stock")
                || ex.getMessage().toLowerCase().contains("enough"));

        verify(productRepository).findById(productId);
        verify(cartRepository).findByUserId(userId);
    }

    @Test
    void addToCart_shouldThrowException_whenStockIsNotEnoughForExistingItem() {
        // GIVEN
        Long userId = 10L;
        Long productId = 5L;

        Product product = buildProduct(productId, 50.0, 4);

        Cart cart = buildEmptyCart(userId);
        CartItem existingItem = buildCartItem(cart, product, 3);
        cart.setItems(new ArrayList<>(List.of(existingItem)));

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));

        // WHEN - THEN
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> cartService.addToCart(userId, productId, 2)); // 3 + 2 = 5 > 4

        assertTrue(ex.getMessage().toLowerCase().contains("stock")
                || ex.getMessage().toLowerCase().contains("enough"));

        verify(productRepository).findById(productId);
        verify(cartRepository).findByUserId(userId);
    }

    @Test
    void getCart_shouldReturnCart_whenCartExists() {
        // GIVEN
        Long userId = 10L;
        Cart cart = buildEmptyCart(userId);

        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));

        // WHEN
        Cart result = cartService.getCart(userId);

        // THEN
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        verify(cartRepository).findByUserId(userId);
    }

    @Test
    void getCart_shouldThrowException_whenCartDoesNotExist() {
        // GIVEN
        Long userId = 10L;
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());

        // WHEN - THEN
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> cartService.getCart(userId));

        assertTrue(ex.getMessage().toLowerCase().contains("cart"));
        verify(cartRepository).findByUserId(userId);
    }
}