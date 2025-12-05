package com.cs308.order.service;

import com.cs308.order.model.Order;
import com.cs308.order.model.OrderItem;
import com.cs308.order.model.enums.OrderStatus;
import com.cs308.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    public List<Order> getOrdersByUserId(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);

        // Mock data if empty (for demonstration)
        if (orders.isEmpty()) {
            return generateMockOrders(userId);
        }

        return orders;
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        try {
            OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(newStatus);
            return orderRepository.save(order);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + status);
        }
    }

    public Order createOrder(Long userId) {
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PREPARING);
        order.setTotalAmount(100.00); // Default amount
        order.setTotalPrice(100.00); // Workaround for DB schema

        // Add a default item
        List<OrderItem> items = new ArrayList<>();
        items.add(new OrderItem(order, 1L, 1, 100.00));
        order.setItems(items);

        return orderRepository.save(order);
    }

    private List<Order> generateMockOrders(Long userId) {
        List<Order> mockOrders = new ArrayList<>();

        // Order 1
        Order order1 = new Order();
        order1.setUserId(userId);
        order1.setOrderDate(LocalDateTime.now().minusDays(2));
        order1.setStatus(OrderStatus.DELIVERED);
        order1.setTotalAmount(150.00);
        order1.setTotalPrice(150.00);

        List<OrderItem> items1 = new ArrayList<>();
        items1.add(new OrderItem(order1, 101L, 1, 100.00));
        items1.add(new OrderItem(order1, 102L, 2, 25.00));
        order1.setItems(items1);

        mockOrders.add(order1);

        // Order 2
        Order order2 = new Order();
        order2.setUserId(userId);
        order2.setOrderDate(LocalDateTime.now().minusDays(10));
        order2.setStatus(OrderStatus.PROCESSING);
        order2.setTotalAmount(89.99);
        order2.setTotalPrice(89.99);

        List<OrderItem> items2 = new ArrayList<>();
        items2.add(new OrderItem(order2, 103L, 1, 89.99));
        order2.setItems(items2);

        mockOrders.add(order2);

        return mockOrders;
    }
}
