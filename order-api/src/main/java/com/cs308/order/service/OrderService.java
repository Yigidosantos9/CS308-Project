package com.cs308.order.service;

import com.cs308.order.dto.RefundRejectDTO;
import com.cs308.order.dto.RefundRequestDTO;
import com.cs308.order.model.Order;
import com.cs308.order.model.OrderItem;
import com.cs308.order.model.enums.OrderStatus;
import com.cs308.order.model.enums.RefundStatus;
import com.cs308.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final EncryptionService encryptionService;

    // Refund window in days (30 days after delivery)
    private static final int REFUND_WINDOW_DAYS = 30;

    public OrderService(OrderRepository orderRepository, EncryptionService encryptionService) {
        this.orderRepository = orderRepository;
        this.encryptionService = encryptionService;
    }

    public List<Order> getOrdersByUserId(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        // Decrypt sensitive fields for each order
        orders.forEach(this::decryptOrderFields);
        return orders;
    }

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        // Force load items and decrypt sensitive fields for each order
        orders.forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().size();
            }
            decryptOrderFields(order);
        });
        return orders;
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null) {
            if (order.getItems() != null) {
                // Force load items (LAZY loading workaround)
                order.getItems().size();
            }
            decryptOrderFields(order);
        }
        return order;
    }

    @Transactional(readOnly = true)
    public Order getOrderByIdAndUser(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId);
        if (order != null) {
            if (order.getItems() != null) {
                order.getItems().size();
            }
            decryptOrderFields(order);
        }
        return order;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        try {
            OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(newStatus);

            // Track delivery time for refund window calculation
            if (newStatus == OrderStatus.DELIVERED && order.getDeliveredAt() == null) {
                order.setDeliveredAt(LocalDateTime.now());
            }

            return orderRepository.save(order);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + status);
        }
    }

    @Transactional
    public Order createOrder(Long userId, com.cs308.order.dto.CreateOrderRequest request) {
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PREPARING);
        order.setRefundStatus(RefundStatus.NONE);

        // Encrypt sensitive buyer information before storage
        if (request != null) {
            order.setBuyerName(encryptionService.encrypt(request.getBuyerName()));
            order.setBuyerAddress(encryptionService.encrypt(request.getBuyerAddress()));
            order.setPaymentMethod(request.getPaymentMethod());
        }

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
                        itemReq.getProductName(),
                        itemReq.getQuantity(),
                        itemReq.getPrice() * itemReq.getQuantity());
                items.add(item);
            }
        }
        order.setItems(items);

        // Save order first to get the ID
        Order savedOrder = orderRepository.save(order);

        // Generate invoice number based on order ID and date
        String invoiceNumber = "INV-" + savedOrder.getOrderDate().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-"
                + savedOrder.getId();
        savedOrder.setInvoiceNumber(invoiceNumber);

        return orderRepository.save(savedOrder);
    }

    // ==================== REFUND METHODS ====================

    /**
     * Request a refund for an order
     * Validates that:
     * - Order exists and belongs to user
     * - Order is delivered
     * - Within 30-day refund window
     * - No existing refund request
     */
    @Transactional
    public Order requestRefund(Long orderId, Long userId, RefundRequestDTO request) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId);

        if (order == null) {
            throw new RuntimeException("Order not found or does not belong to user");
        }

        // Validate order status - must be DELIVERED to request refund
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Only delivered orders can be refunded. Current status: " + order.getStatus());
        }

        // Check if refund already requested/processed (null is treated as NONE)
        if (order.getRefundStatus() != null && order.getRefundStatus() != RefundStatus.NONE) {
            throw new RuntimeException(
                    "Refund already " + order.getRefundStatus().toString().toLowerCase() + " for this order");
        }

        // Validate refund window (30 days from delivery)
        LocalDateTime deliveryDate = order.getDeliveredAt();
        if (deliveryDate == null) {
            // Fallback: use order date + reasonable delivery estimate if deliveredAt not
            // set
            deliveryDate = order.getOrderDate().plusDays(3);
        }

        long daysSinceDelivery = ChronoUnit.DAYS.between(deliveryDate, LocalDateTime.now());
        if (daysSinceDelivery > REFUND_WINDOW_DAYS) {
            throw new RuntimeException("Refund window has expired. Refunds must be requested within "
                    + REFUND_WINDOW_DAYS + " days of delivery. Days since delivery: " + daysSinceDelivery);
        }

        // Set refund request details
        order.setRefundStatus(RefundStatus.PENDING);
        order.setRefundRequestedAt(LocalDateTime.now());
        order.setRefundReason(request.getReason());
        // --- ADD THESE LINES ---
        System.out.println(">>> DB LOG CHECK: Order #" + order.getId() +
                " RefundStatus: " + order.getRefundStatus());
        // -----------------------
        return orderRepository.save(order);
    }

    /**
     * Approve a refund request (PM action)
     * Returns the order with items for stock restoration
     */
    @Transactional
    public Order approveRefund(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (order.getRefundStatus() != RefundStatus.PENDING) {
            throw new RuntimeException("Order does not have a pending refund request");
        }

        // Force load items for stock restoration
        if (order.getItems() != null) {
            order.getItems().size();
        }

        order.setRefundStatus(RefundStatus.APPROVED);
        order.setRefundProcessedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.REFUNDED);

        return orderRepository.save(order);
    }

    /**
     * Reject a refund request (PM action)
     */
    @Transactional
    public Order rejectRefund(Long orderId, RefundRejectDTO request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (order.getRefundStatus() != RefundStatus.PENDING) {
            throw new RuntimeException("Order does not have a pending refund request");
        }

        order.setRefundStatus(RefundStatus.REJECTED);
        order.setRefundProcessedAt(LocalDateTime.now());
        if (request != null && request.getReason() != null) {
            order.setRefundRejectionReason(request.getReason());
        }

        return orderRepository.save(order);
    }

    /**
     * Get all pending refund requests (for PM dashboard)
     */
    @Transactional(readOnly = true)
    public List<Order> getPendingRefundRequests() {
        List<Order> orders = orderRepository.findPendingRefundRequests();
        // Force load items for each order
        orders.forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().size();
            }
        });
        return orders;
    }

    /**
     * Get count of pending refund requests
     */
    public Long countPendingRefundRequests() {
        return orderRepository.countPendingRefundRequests();
    }

    /**
     * Check if an order is eligible for refund
     */
    public boolean isEligibleForRefund(Order order) {
        if (order == null)
            return false;
        if (order.getStatus() != OrderStatus.DELIVERED)
            return false;
        // null is treated as NONE (eligible)
        if (order.getRefundStatus() != null && order.getRefundStatus() != RefundStatus.NONE)
            return false;

        LocalDateTime deliveryDate = order.getDeliveredAt();
        if (deliveryDate == null) {
            deliveryDate = order.getOrderDate().plusDays(3);
        }

        long daysSinceDelivery = ChronoUnit.DAYS.between(deliveryDate, LocalDateTime.now());
        return daysSinceDelivery <= REFUND_WINDOW_DAYS;
    }

    /**
     * Get days remaining in refund window
     */
    public int getDaysRemainingForRefund(Order order) {
        if (order == null || order.getStatus() != OrderStatus.DELIVERED)
            return 0;

        LocalDateTime deliveryDate = order.getDeliveredAt();
        if (deliveryDate == null) {
            deliveryDate = order.getOrderDate().plusDays(3);
        }

        long daysSinceDelivery = ChronoUnit.DAYS.between(deliveryDate, LocalDateTime.now());
        int daysRemaining = REFUND_WINDOW_DAYS - (int) daysSinceDelivery;
        return Math.max(0, daysRemaining);
    }

    // ==================== DATE RANGE QUERIES ====================

    /**
     * Get orders within a date range (for Sales Manager invoice filtering)
     */
    @Transactional(readOnly = true)
    public List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> orders = orderRepository.findByOrderDateBetween(startDate, endDate);
        // Force load items and decrypt sensitive fields for each order
        orders.forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().size();
            }
            decryptOrderFields(order);
        });
        return orders;
    }

    // ==================== CANCEL ORDER METHODS ====================

    /**
     * Cancel an order
     * Only PROCESSING and PREPARING orders can be cancelled
     */
    @Transactional
    public Order cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId);

        if (order == null) {
            throw new RuntimeException("Order not found or does not belong to user");
        }

        // Only allow cancellation for PROCESSING or PREPARING orders
        if (order.getStatus() != OrderStatus.PROCESSING && order.getStatus() != OrderStatus.PREPARING) {
            throw new RuntimeException(
                    "Only orders in PROCESSING or PREPARING status can be cancelled. Current status: "
                            + order.getStatus());
        }

        // Update order status to CANCELLED
        order.setStatus(OrderStatus.CANCELLED);
        // --- ADD THESE LINES ---
        System.out.println(">>> DB LOG CHECK: Order #" + order.getId() +
                " RefundStatus: " + order.getRefundStatus());
        // -----------------------
        return orderRepository.save(order);
    }

    // ==================== ENCRYPTION HELPERS ====================

    /**
     * Decrypt sensitive fields in an order for API responses
     * Handles backwards compatibility with existing unencrypted data
     */
    private void decryptOrderFields(Order order) {
        if (order == null)
            return;

        // Decrypt buyer name if present
        if (order.getBuyerName() != null && !order.getBuyerName().isEmpty()) {
            order.setBuyerName(encryptionService.decrypt(order.getBuyerName()));
        }

        // Decrypt buyer address if present
        if (order.getBuyerAddress() != null && !order.getBuyerAddress().isEmpty()) {
            order.setBuyerAddress(encryptionService.decrypt(order.getBuyerAddress()));
        }
    }
}