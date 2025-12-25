package com.cs308.order.controller;

import com.cs308.order.dto.RefundRejectDTO;
import com.cs308.order.dto.RefundRequestDTO;
import com.cs308.order.model.Order;
import com.cs308.order.model.InvoiceRequest;
import com.cs308.order.model.InvoiceItem;
import com.cs308.order.service.OrderService;
import com.cs308.order.service.InvoicePdfService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;
    private final InvoicePdfService invoicePdfService;

    public OrderController(OrderService orderService, InvoicePdfService invoicePdfService) {
        this.orderService = orderService;
        this.invoicePdfService = invoicePdfService;
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrders(@RequestParam Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // ==================== DATE RANGE QUERIES ====================

    /**
     * Get orders within a date range (for Sales Manager invoice filtering)
     * GET /orders/date-range?startDate=yyyy-MM-dd&endDate=yyyy-MM-dd
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<Order>> getOrdersByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
            return ResponseEntity.ok(orderService.getOrdersByDateRange(start, end));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        Order order = userId != null ? orderService.getOrderByIdAndUser(id, userId) : orderService.getOrderById(id);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(order);
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestParam Long userId,
            @RequestBody(required = false) com.cs308.order.dto.CreateOrderRequest request) {
        try {
            return ResponseEntity.ok(orderService.createOrder(userId, request));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== REFUND ENDPOINTS ====================

    /**
     * Customer requests a refund for their order
     * POST /orders/{id}/refund?userId={userId}
     */
    @PostMapping("/{id}/refund")
    public ResponseEntity<?> requestRefund(
            @PathVariable Long id,
            @RequestParam Long userId,
            @Valid @RequestBody RefundRequestDTO request) {
        try {
            Order order = orderService.requestRefund(id, userId, request);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * PM approves a refund request
     * PUT /orders/{id}/refund/approve
     */
    @PutMapping("/{id}/refund/approve")
    public ResponseEntity<?> approveRefund(@PathVariable Long id) {
        try {
            Order order = orderService.approveRefund(id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * PM rejects a refund request
     * PUT /orders/{id}/refund/reject
     */
    @PutMapping("/{id}/refund/reject")
    public ResponseEntity<?> rejectRefund(
            @PathVariable Long id,
            @RequestBody(required = false) RefundRejectDTO request) {
        try {
            Order order = orderService.rejectRefund(id, request);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get all pending refund requests (for PM dashboard)
     * GET /orders/refunds/pending
     */
    @GetMapping("/refunds/pending")
    public ResponseEntity<List<Order>> getPendingRefundRequests() {
        return ResponseEntity.ok(orderService.getPendingRefundRequests());
    }

    /**
     * Get count of pending refund requests
     * GET /orders/refunds/pending/count
     */
    @GetMapping("/refunds/pending/count")
    public ResponseEntity<Map<String, Long>> getPendingRefundCount() {
        Map<String, Long> response = new HashMap<>();
        response.put("count", orderService.countPendingRefundRequests());
        return ResponseEntity.ok(response);
    }

    /**
     * Check if an order is eligible for refund
     * GET /orders/{id}/refund/eligibility?userId={userId}
     */
    @GetMapping("/{id}/refund/eligibility")
    public ResponseEntity<Map<String, Object>> checkRefundEligibility(
            @PathVariable Long id,
            @RequestParam Long userId) {
        Order order = orderService.getOrderByIdAndUser(id, userId);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("eligible", orderService.isEligibleForRefund(order));
        response.put("daysRemaining", orderService.getDaysRemainingForRefund(order));
        response.put("orderStatus", order.getStatus());
        response.put("refundStatus", order.getRefundStatus());

        return ResponseEntity.ok(response);
    }

    // ==================== CANCEL ORDER ENDPOINTS ====================

    /**
     * Customer cancels an order (only for PROCESSING/PREPARING orders)
     * POST /orders/{id}/cancel?userId={userId}
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            Order order = orderService.cancelOrder(id, userId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==================== INVOICE ENDPOINT ====================

    @GetMapping(value = "/{id}/invoice", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<ByteArrayResource> getInvoice(@PathVariable Long id,
            @RequestParam(required = false) String buyerName,
            @RequestParam(required = false) String buyerAddress,
            @RequestParam(required = false) String paymentMethod) {
        try {
            Order order = orderService.getOrderById(id);
            if (order == null) {
                return ResponseEntity.notFound().build();
            }

            // Build invoice request from order
            InvoiceRequest invoiceRequest = new InvoiceRequest();
            invoiceRequest.setInvoiceNumber(
                    order.getInvoiceNumber() != null ? order.getInvoiceNumber() : "INV-" + order.getId());
            invoiceRequest.setIssueDate(order.getOrderDate().format(DateTimeFormatter.ISO_LOCAL_DATE));
            invoiceRequest.setDueDate(order.getOrderDate().plusDays(30).format(DateTimeFormatter.ISO_LOCAL_DATE));
            invoiceRequest.setBuyerName(
                    buyerName != null && !buyerName.isEmpty() ? buyerName
                            : (order.getBuyerName() != null ? order.getBuyerName() : "Customer #" + order.getUserId()));
            invoiceRequest.setBuyerAddress(
                    buyerAddress != null && !buyerAddress.isEmpty() ? buyerAddress
                            : (order.getBuyerAddress() != null ? order.getBuyerAddress() : "Address on file"));
            invoiceRequest.setSellerName("RAWCTRL Store");
            invoiceRequest.setSellerAddress("Istanbul, Turkey");
            invoiceRequest.setTaxRate(0.18); // 18% VAT
            invoiceRequest.setShippingFee(0.0);
            invoiceRequest.setCurrencySymbol("$");
            invoiceRequest.setPaymentMethod(
                    paymentMethod != null && !paymentMethod.isEmpty()
                            ? paymentMethod
                            : order.getPaymentMethod());
            invoiceRequest.setOrderId("Order #" + order.getId());

            // Convert order items to invoice items
            // Prices are VAT-inclusive, so divide by 1.18 to get net price for invoice
            List<InvoiceItem> invoiceItems = order.getItems().stream()
                    .map(item -> {
                        InvoiceItem invoiceItem = new InvoiceItem();
                        invoiceItem.setDescription(item.getProductName() != null ? item.getProductName()
                                : "Product #" + item.getProductId());
                        invoiceItem.setQuantity(item.getQuantity());
                        // Calculate net unit price (before VAT) from VAT-inclusive price
                        Double grossUnitPrice = item.getUnitPrice() != null ? item.getUnitPrice()
                                : item.getPrice() / item.getQuantity();
                        invoiceItem.setUnitPrice(grossUnitPrice / 1.18); // Remove 18% VAT
                        return invoiceItem;
                    })
                    .collect(Collectors.toList());
            invoiceRequest.setItems(invoiceItems);

            byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoiceRequest);

            String filename = "invoice-" + invoiceRequest.getInvoiceNumber() + ".pdf";
            ContentDisposition contentDisposition = ContentDisposition.attachment()
                    .filename(filename)
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentDisposition(contentDisposition);

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(pdfBytes.length)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(new ByteArrayResource(pdfBytes));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}