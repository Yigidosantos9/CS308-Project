package com.cs308.gateway.service;

import com.cs308.gateway.model.product.Order;
import com.cs308.gateway.client.OrderClient;
import com.cs308.gateway.client.ProductClient;
import com.cs308.gateway.model.invoice.InvoiceRequest;
import com.cs308.gateway.model.product.CreateOrderRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderClient orderClient;
    private final ProductClient productClient;

    public Order createOrder(Long userId, CreateOrderRequest request) {
        log.info("Processing create order request for userId: {}", userId);

        // Create order first
        Order order = orderClient.createOrder(userId, request);

        // Reduce stock for each item after order is created
        if (request != null && request.getItems() != null) {
            for (CreateOrderRequest.OrderItemRequest item : request.getItems()) {
                try {
                    productClient.reduceStock(item.getProductId(), item.getQuantity());
                    log.info("Reduced stock for product {} by {}", item.getProductId(), item.getQuantity());
                } catch (Exception e) {
                    log.error("Failed to reduce stock for product {}: {}", item.getProductId(), e.getMessage());
                    // Continue with other items even if one fails
                }
            }
        }

        return order;
    }

    public Order getOrder(Long orderId, Long userId) {
        log.info("Processing get order request - orderId: {}, userId: {}", orderId, userId);
        return orderClient.getOrder(orderId, userId);
    }

    public List<Order> getUserOrders(Long userId) {
        log.info("Processing get user orders request for userId: {}", userId);
        return orderClient.getUserOrders(userId);
    }

    public byte[] generateInvoicePdf(InvoiceRequest request) {
        log.info("Processing invoice PDF generation for invoiceNumber: {}", request.getInvoiceNumber());
        return orderClient.generateInvoicePdf(request);
    }

    public byte[] getOrderInvoice(Long orderId) {
        log.info("Processing get order invoice for orderId: {}", orderId);
        return orderClient.getOrderInvoice(orderId);
    }

    public void updateOrderStatus(Long orderId, String status) {
        log.info("Processing update order status request - orderId: {}, status: {}", orderId, status);
        orderClient.updateOrderStatus(orderId, status);
    }
}
