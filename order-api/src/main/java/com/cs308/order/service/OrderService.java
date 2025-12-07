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
        return orderRepository.findByUserId(userId);
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

    public Order createOrder(Long userId, com.cs308.order.dto.CreateOrderRequest request) {
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PREPARING);

        // Use actual price from request, fallback to 0 if not provided
        Double totalPrice = (request != null && request.getTotalPrice() != null)
                ? request.getTotalPrice()
                : 0.0;
        order.setTotalAmount(totalPrice);
        order.setTotalPrice(totalPrice);

        // Create order items from request
        List<OrderItem> items = new ArrayList<>();
        if (request != null && request.getItems() != null) {
            for (com.cs308.order.dto.CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
                OrderItem item = new OrderItem(
                        order,
                        itemReq.getProductId(),
                        itemReq.getQuantity(),
                        itemReq.getPrice() * itemReq.getQuantity());
                items.add(item);
            }
        }
        order.setItems(items);

        return orderRepository.save(order);
    }
}
