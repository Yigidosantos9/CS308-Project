package com.cs308.gateway.service;

import com.cs308.gateway.model.product.Order;
import com.cs308.gateway.client.OrderClient;
import com.cs308.gateway.client.ProductClient;
import com.cs308.gateway.model.invoice.InvoiceRequest;
import com.cs308.gateway.model.product.CreateOrderRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class OrderService {

    private final OrderClient orderClient;
    private final ProductClient productClient;
    private final InvoiceEmailService invoiceEmailService;
    private final AuthService authService;

    public OrderService(OrderClient orderClient, ProductClient productClient,
            @org.springframework.context.annotation.Lazy InvoiceEmailService invoiceEmailService,
            @org.springframework.context.annotation.Lazy AuthService authService) {
        this.orderClient = orderClient;
        this.productClient = productClient;
        this.invoiceEmailService = invoiceEmailService;
        this.authService = authService;
    }

    public Order createOrder(Long userId, String userEmail, CreateOrderRequest request) {
        log.info("Processing create order request for userId: {}", userId);

        // Populate prices from product service
        double totalPrice = 0.0;
        if (request != null && request.getItems() != null) {
            for (CreateOrderRequest.OrderItemRequest item : request.getItems()) {
                try {
                    com.cs308.gateway.model.product.Product product = productClient.getProduct(item.getProductId());
                    if (product != null) {
                        item.setPrice(product.getPrice());
                        if (item.getQuantity() != null) {
                            totalPrice += product.getPrice() * item.getQuantity();
                        }
                    } else {
                        log.error("Product not found for id: {}", item.getProductId());
                        throw new RuntimeException("Product not found: " + item.getProductId());
                    }
                } catch (Exception e) {
                    log.error("Failed to fetch product details for id: {}", item.getProductId(), e);
                    throw new RuntimeException("Failed to fetch product details", e);
                }
            }
            request.setTotalPrice(totalPrice);
        }

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

        // Send invoice email
        try {
            if (userEmail != null && !userEmail.isEmpty()) {
                log.info("Fetching invoice PDF for order {} to send email to {}", order.getId(), userEmail);

                String buyerName = null;
                try {
                    com.cs308.gateway.model.auth.response.UserDetails user = authService.getUserById(userId);
                    if (user != null) {
                        buyerName = (user.getFirstName() != null ? user.getFirstName() : "") + " " +
                                (user.getLastName() != null ? user.getLastName() : "");
                        buyerName = buyerName.trim();
                        if (buyerName.isEmpty()) {
                            buyerName = null;
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to fetch user details for invoice name, using default", e);
                }

                byte[] pdfBytes = orderClient.getOrderInvoice(order.getId(), buyerName);
                // Use order ID as invoice number for now since we don't have the invoice object
                invoiceEmailService.sendInvoiceEmail(userEmail, pdfBytes, String.valueOf(order.getId()));
            }
        } catch (Exception e) {
            log.error("Failed to send invoice email for order " + order.getId(), e);
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

    public List<Order> getAllOrders() {
        log.info("Processing get all orders request (Product Manager)");
        return orderClient.getAllOrders();
    }

    public byte[] generateInvoicePdf(InvoiceRequest request) {
        log.info("Processing invoice PDF generation for invoiceNumber: {}", request.getInvoiceNumber());
        return orderClient.generateInvoicePdf(request);
    }

    public byte[] getOrderInvoice(Long orderId) {
        log.info("Processing get order invoice for orderId: {}", orderId);
        return orderClient.getOrderInvoice(orderId, null);
    }

    public void updateOrderStatus(Long orderId, String status) {
        log.info("Processing update order status request - orderId: {}, status: {}", orderId, status);
        orderClient.updateOrderStatus(orderId, status);
    }
}
