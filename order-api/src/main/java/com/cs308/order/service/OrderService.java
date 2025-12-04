package com.cs308.order.service;

import com.cs308.order.model.Order;
import com.cs308.order.model.OrderItem;
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

    private List<Order> generateMockOrders(Long userId) {
        List<Order> mockOrders = new ArrayList<>();

        // Order 1
        Order order1 = new Order();
        order1.setUserId(userId);
        order1.setOrderDate(LocalDateTime.now().minusDays(2));
        order1.setStatus("DELIVERED");
        order1.setTotalAmount(150.00);

        List<OrderItem> items1 = new ArrayList<>();
        items1.add(new OrderItem(order1, 101L, 1, 100.00));
        items1.add(new OrderItem(order1, 102L, 2, 25.00));
        order1.setItems(items1);

        mockOrders.add(order1);

        // Order 2
        Order order2 = new Order();
        order2.setUserId(userId);
        order2.setOrderDate(LocalDateTime.now().minusDays(10));
        order2.setStatus("PROCESSING");
        order2.setTotalAmount(89.99);

        List<OrderItem> items2 = new ArrayList<>();
        items2.add(new OrderItem(order2, 103L, 1, 89.99));
        order2.setItems(items2);

        mockOrders.add(order2);

        return mockOrders;
    }
}
