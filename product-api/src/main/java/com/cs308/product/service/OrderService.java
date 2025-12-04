package com.cs308.product.service;

import com.cs308.product.domain.Cart;
import com.cs308.product.domain.Order;
import com.cs308.product.domain.OrderItem;
import com.cs308.product.domain.enums.OrderStatus;
import com.cs308.product.repository.CartRepository;
import com.cs308.product.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;

    @Transactional
    public Order createOrder(Long userId) {
        // Get user's cart
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found or empty"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot create order from empty cart");
        }

        // Validate stock availability
        for (var cartItem : cart.getItems()) {
            if (cartItem.getQuantity() > cartItem.getProduct().getStock()) {
                throw new RuntimeException("Insufficient stock for product: " + cartItem.getProduct().getName());
            }
        }

        // Create order
        Order order = Order.builder()
                .userId(userId)
                .status(OrderStatus.PROCESSING)
                .totalPrice(cart.getTotalPrice())
                .build();

        // Convert cart items to order items
        for (var cartItem : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getProduct().getPrice())
                    .build();
            order.addItem(orderItem);

            // Update product stock
            cartItem.getProduct().setStock(
                    cartItem.getProduct().getStock() - cartItem.getQuantity()
            );
        }

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Clear cart after successful order
        cart.getItems().clear();
        cart.setTotalPrice(0.0);
        cart.setTotalQuantity(0);
        cartRepository.save(cart);

        return savedOrder;
    }

    @Transactional(readOnly = true)
    public Order getOrder(Long orderId, Long userId) {
        return orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Transactional(readOnly = true)
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }
}

