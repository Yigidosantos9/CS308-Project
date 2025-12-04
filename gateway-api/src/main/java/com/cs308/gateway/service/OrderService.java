package com.cs308.gateway.service;

import com.cs308.gateway.client.ProductClient;
import com.cs308.gateway.model.product.Order;
import com.cs308.gateway.client.OrderClient;
import com.cs308.gateway.model.invoice.InvoiceRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final ProductClient productClient;

    public Order createOrder(Long userId) {
        log.info("Processing create order request for userId: {}", userId);
        return productClient.createOrder(userId);
    }

    public Order getOrder(Long orderId, Long userId) {
        log.info("Processing get order request - orderId: {}, userId: {}", orderId, userId);
        return productClient.getOrder(orderId, userId);
    }

    public List<Order> getUserOrders(Long userId) {
        log.info("Processing get user orders request for userId: {}", userId);
        return productClient.getUserOrders(userId);
    }
}

    private final OrderClient orderClient;

    public byte[] generateInvoicePdf(InvoiceRequest request) {
        log.info("Processing invoice PDF generation for invoiceNumber: {}", request.getInvoiceNumber());
        return orderClient.generateInvoicePdf(request);
    }
}
