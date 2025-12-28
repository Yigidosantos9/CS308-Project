package com.cs308.gateway.service;

import com.cs308.gateway.model.product.Order;
import com.cs308.gateway.client.OrderClient;
import com.cs308.gateway.client.ProductClient;
import com.cs308.gateway.model.invoice.InvoiceRequest;
import com.cs308.gateway.model.product.CreateOrderRequest;
import com.cs308.gateway.model.order.RefundRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

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
                        item.setProductName(product.getName());
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
                }
            }
        }

        // Send invoice email logic (kept same as your provided code)
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
                        if (buyerName.isEmpty())
                            buyerName = null;
                    }
                } catch (Exception e) {
                    log.warn("Failed to fetch user details for invoice name", e);
                }
                byte[] pdfBytes = orderClient.getOrderInvoice(order.getId(), buyerName, null, null);
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

    // ==================== DATE RANGE QUERIES ====================

    /**
     * Get orders within a date range (for Sales Manager invoice filtering)
     */
    public List<Order> getOrdersByDateRange(String startDate, String endDate) {
        log.info("Processing get orders by date range request - startDate: {}, endDate: {}", startDate, endDate);
        return orderClient.getOrdersByDateRange(startDate, endDate);
    }

    public byte[] generateInvoicePdf(InvoiceRequest request) {
        log.info("Processing invoice PDF generation for invoiceNumber: {}", request.getInvoiceNumber());
        return orderClient.generateInvoicePdf(request);
    }

    public byte[] getOrderInvoice(Long orderId) {
        return orderClient.getOrderInvoice(orderId, null, null, null);
    }

    public byte[] getOrderInvoice(Long orderId, String buyerAddress) {
        return orderClient.getOrderInvoice(orderId, null, buyerAddress, null);
    }

    public byte[] getOrderInvoice(Long userId, Long orderId, String buyerName, String buyerAddress,
            String paymentMethod) {
        log.info("Processing get order invoice for orderId: {} with overrides", orderId);
        Order order = orderClient.getOrder(orderId, userId);
        String resolvedName = buyerName != null && !buyerName.isEmpty() ? buyerName
                : (order != null ? order.getBuyerName() : null);
        String resolvedAddress = buyerAddress != null && !buyerAddress.isEmpty() ? buyerAddress
                : (order != null ? order.getBuyerAddress() : null);
        String resolvedPayment = paymentMethod != null && !paymentMethod.isEmpty() ? paymentMethod
                : (order != null ? order.getPaymentMethod() : null);
        return orderClient.getOrderInvoice(orderId, resolvedName, resolvedAddress, resolvedPayment);
    }

    public void updateOrderStatus(Long orderId, String status) {
        log.info("Processing update order status request - orderId: {}, status: {}", orderId, status);
        orderClient.updateOrderStatus(orderId, status);
    }

    // ==================== NEWLY ADDED METHODS ====================
    // These were missing from your Gateway Service

    public Order cancelOrder(Long orderId, Long userId) {
        log.info("GATEWAY LOG: Processing cancel order request - orderId: {}, userId: {}", orderId, userId);
        return orderClient.cancelOrder(orderId, userId);
    }

    public Order requestRefund(Long orderId, Long userId, RefundRequest request) {
        log.info("GATEWAY LOG: Processing refund request - orderId: {}, userId: {}", orderId, userId);
        return orderClient.requestRefund(orderId, userId, request);
    }

    public Map<String, Object> checkRefundEligibility(Long orderId, Long userId) {
        log.info("GATEWAY LOG: Checking refund eligibility - orderId: {}, userId: {}", orderId, userId);
        return orderClient.checkRefundEligibility(orderId, userId);
    }

    // ==================== REVENUE CALCULATION ====================

    /**
     * Calculate revenue statistics for a date range
     * Cost is calculated as 50% of revenue (per project requirements)
     */
    public com.cs308.gateway.model.order.RevenueStats calculateRevenueStats(String startDate, String endDate) {
        log.info("Processing revenue stats calculation - startDate: {}, endDate: {}", startDate, endDate);

        List<Order> orders = orderClient.getOrdersByDateRange(startDate, endDate);

        // Filter to only include completed orders (DELIVERED, IN_TRANSIT, PREPARING,
        // PROCESSING)
        // Exclude CANCELLED and REFUNDED
        List<Order> validOrders = orders.stream()
                .filter(o -> o.getStatus() != null &&
                        o.getStatus() != com.cs308.gateway.model.product.enums.OrderStatus.CANCELLED &&
                        o.getStatus() != com.cs308.gateway.model.product.enums.OrderStatus.REFUNDED)
                .toList();

        // Group orders by date
        java.util.Map<String, java.util.List<Order>> ordersByDate = validOrders.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        o -> o.getOrderDate() != null
                                ? o.getOrderDate().toLocalDate().toString()
                                : startDate));

        // Calculate daily stats
        java.util.List<com.cs308.gateway.model.order.RevenueStats.DailyRevenue> dailyData = new java.util.ArrayList<>();
        double totalRevenue = 0.0;

        // Sort dates
        java.util.List<String> sortedDates = new java.util.ArrayList<>(ordersByDate.keySet());
        java.util.Collections.sort(sortedDates);

        for (String date : sortedDates) {
            java.util.List<Order> dateOrders = ordersByDate.get(date);
            double dayRevenue = dateOrders.stream()
                    .mapToDouble(o -> o.getTotalPrice() != null ? o.getTotalPrice() : 0.0)
                    .sum();
            double dayCost = dayRevenue * 0.5; // 50% cost
            double dayProfit = dayRevenue - dayCost;

            dailyData.add(com.cs308.gateway.model.order.RevenueStats.DailyRevenue.builder()
                    .date(date)
                    .revenue(Math.round(dayRevenue * 100.0) / 100.0)
                    .cost(Math.round(dayCost * 100.0) / 100.0)
                    .profit(Math.round(dayProfit * 100.0) / 100.0)
                    .orderCount(dateOrders.size())
                    .build());

            totalRevenue += dayRevenue;
        }

        double totalCost = totalRevenue * 0.5;
        double totalProfit = totalRevenue - totalCost;

        return com.cs308.gateway.model.order.RevenueStats.builder()
                .totalRevenue(Math.round(totalRevenue * 100.0) / 100.0)
                .totalCost(Math.round(totalCost * 100.0) / 100.0)
                .totalProfit(Math.round(totalProfit * 100.0) / 100.0)
                .orderCount(validOrders.size())
                .dailyData(dailyData)
                .build();
    }
}