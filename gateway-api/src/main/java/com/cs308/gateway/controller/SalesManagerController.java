package com.cs308.gateway.controller;

import com.cs308.gateway.client.OrderClient;
import com.cs308.gateway.model.auth.enums.UserType;
import com.cs308.gateway.model.invoice.InvoiceEmailRequest;
import com.cs308.gateway.model.invoice.InvoiceRequest;
import com.cs308.gateway.model.invoice.RefundEmailRequest;
import com.cs308.gateway.model.order.RefundReject;
import com.cs308.gateway.model.product.Order;
import com.cs308.gateway.model.product.OrderItem;
import com.cs308.gateway.model.product.Product;
import com.cs308.gateway.model.product.StockRestoreRequest;
import com.cs308.gateway.security.RequiresRole;
import com.cs308.gateway.service.InvoiceEmailService;
import com.cs308.gateway.service.OrderService;
import com.cs308.gateway.service.ProductService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/sales")
@RequiresRole({ UserType.SALES_MANAGER })
@RequiredArgsConstructor
public class SalesManagerController {

    private final OrderService orderService;
    private final OrderClient orderClient;
    private final InvoiceEmailService invoiceEmailService;
    private final ProductService productService;
    private final com.cs308.gateway.service.AuthService authService;

    // Sales Manager can set product prices
    @PutMapping("/products/{productId}/price")
    public ResponseEntity<?> setProductPrice(
            @PathVariable Long productId,
            @RequestParam @PositiveOrZero Double price) {
        log.info("BFF: Set product price request - productId: {}, price: {}", productId, price);
        return ResponseEntity.ok(productService.setProductPrice(productId, price));
    }

    // Sales Manager can set discounts
    @PostMapping("/products/{productId}/discount")
    public ResponseEntity<?> setDiscount(
            @PathVariable Long productId,
            @RequestParam Double discountRate) {
        log.info("BFF: Set discount request - productId: {}, discountRate: {}", productId, discountRate);
        // TODO: Implement set discount
        return ResponseEntity.ok().build();
    }

    // Sales Manager can view invoices in date range
    @GetMapping("/invoices")
    public ResponseEntity<?> getInvoices(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        log.info("BFF: Get invoices request - startDate: {}, endDate: {}", startDate, endDate);
        // TODO: Implement get invoices
        return ResponseEntity.ok().build();
    }

    // Generate invoice PDF on demand (proxied to Order API)
    @PostMapping(value = "/invoices/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<ByteArrayResource> generateInvoicePdf(@Valid @RequestBody InvoiceRequest request) {
        log.info("BFF: Generate invoice PDF - invoiceNumber: {}", request.getInvoiceNumber());
        byte[] pdfBytes = orderService.generateInvoicePdf(request);

        String filename = "invoice-" + request.getInvoiceNumber() + ".pdf";
        ContentDisposition contentDisposition = ContentDisposition.attachment()
                .filename(filename)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(contentDisposition);

        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(pdfBytes != null ? pdfBytes.length : 0)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new ByteArrayResource(pdfBytes != null ? pdfBytes : new byte[0]));
    }

    // Send invoice as email with PDF attachment
    @PostMapping("/invoices/email")
    public ResponseEntity<Void> emailInvoice(@Valid @RequestBody InvoiceEmailRequest request) {
        log.info("BFF: Send invoice email - to: {}, invoiceNumber: {}",
                request.getTo(), request.getInvoice().getInvoiceNumber());
        invoiceEmailService.sendInvoiceEmail(request);
        return ResponseEntity.accepted().build();
    }

    // Sales Manager can calculate revenue and profit
    @GetMapping("/revenue")
    public ResponseEntity<?> calculateRevenue(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        log.info("BFF: Calculate revenue request - startDate: {}, endDate: {}", startDate, endDate);
        // TODO: Implement calculate revenue
        return ResponseEntity.ok().build();
    }

    // ==================== REFUND MANAGEMENT ====================

    /**
     * Get all pending refund requests
     */
    @GetMapping("/refunds/pending")
    public ResponseEntity<?> getPendingRefunds() {
        log.info("BFF: Get pending refund requests");
        try {
            List<Order> pendingRefunds = orderClient.getPendingRefundRequests();
            return ResponseEntity.ok(pendingRefunds);
        } catch (Exception e) {
            log.error("Failed to fetch pending refunds", e);
            return ResponseEntity.internalServerError().body("Failed to fetch pending refunds");
        }
    }

    /**
     * Get count of pending refund requests
     */
    @GetMapping("/refunds/pending/count")
    public ResponseEntity<?> getPendingRefundCount() {
        log.info("BFF: Get pending refund count");
        try {
            Long count = orderClient.getPendingRefundCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Failed to fetch pending refund count", e);
            return ResponseEntity.ok(0L);
        }
    }

    /**
     * Approve a refund request
     * - Updates order status in order-api
     * - Restores stock for all items
     * - Sends approval email to customer
     */
    @PutMapping("/refunds/{orderId}/approve")
    public ResponseEntity<?> approveRefund(@PathVariable Long orderId) {
        log.info("BFF: Approve refund request - orderId: {}", orderId);

        try {
            // 1. Call order-api to approve the refund and get order details
            Order order = orderClient.approveRefund(orderId);
            
            if (order == null) {
                return ResponseEntity.badRequest().body("Order not found or refund already processed");
            }

            // 2. Restore stock for each item
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                for (OrderItem item : order.getItems()) {
                    try {
                        StockRestoreRequest stockRequest = new StockRestoreRequest();
                        stockRequest.setProductId(item.getProductId());
                        stockRequest.setQuantity(item.getQuantity());
                        productService.restoreStock(stockRequest);
                        log.info("Stock restored for product {} - quantity: {}", 
                                item.getProductId(), item.getQuantity());
                    } catch (Exception e) {
                        log.error("Failed to restore stock for product {}: {}", 
                                item.getProductId(), e.getMessage());
                        // Continue with other items even if one fails
                    }
                }
            }

            // 3. Send approval email to customer
            try {
                com.cs308.gateway.model.auth.response.UserDetails user = 
                        authService.getUserById(order.getUserId());

                if (user != null && user.getEmail() != null) {
                    String productNames = getProductNamesForOrder(order);

                    RefundEmailRequest emailRequest = RefundEmailRequest.builder()
                            .to(user.getEmail())
                            .orderId(orderId)
                            .refundAmount(order.getTotalPrice())
                            .productName(productNames)
                            .build();

                    invoiceEmailService.sendRefundEmail(emailRequest);
                    log.info("Refund approval email sent to {}", user.getEmail());
                }
            } catch (Exception e) {
                log.error("Failed to send refund approval email", e);
                // Don't fail the request just because email failed
            }

            return ResponseEntity.ok("Refund approved successfully. Stock restored and customer notified.");

        } catch (Exception e) {
            log.error("Failed to approve refund for order {}", orderId, e);
            return ResponseEntity.internalServerError()
                    .body("Failed to approve refund: " + e.getMessage());
        }
    }

    /**
     * Reject a refund request
     * - Updates order status in order-api
     * - Sends rejection email to customer with optional reason
     */
    @PutMapping("/refunds/{orderId}/reject")
    public ResponseEntity<?> rejectRefund(
            @PathVariable Long orderId,
            @RequestBody(required = false) RefundReject request) {
        log.info("BFF: Reject refund request - orderId: {}", orderId);

        try {
            // 1. Call order-api to reject the refund
            Order order = orderClient.rejectRefund(orderId, request);
            
            if (order == null) {
                return ResponseEntity.badRequest().body("Order not found or refund already processed");
            }

            // 2. Send rejection email to customer
            try {
                com.cs308.gateway.model.auth.response.UserDetails user = 
                        authService.getUserById(order.getUserId());

                if (user != null && user.getEmail() != null) {
                    String productNames = getProductNamesForOrder(order);

                    RefundEmailRequest emailRequest = RefundEmailRequest.builder()
                            .to(user.getEmail())
                            .orderId(orderId)
                            .refundAmount(order.getTotalPrice())
                            .productName(productNames)
                            .rejectionReason(request != null ? request.getReason() : null)
                            .build();

                    invoiceEmailService.sendRefundRejectionEmail(emailRequest);
                    log.info("Refund rejection email sent to {}", user.getEmail());
                }
            } catch (Exception e) {
                log.error("Failed to send refund rejection email", e);
                // Don't fail the request just because email failed
            }

            return ResponseEntity.ok("Refund request rejected. Customer has been notified.");

        } catch (Exception e) {
            log.error("Failed to reject refund for order {}", orderId, e);
            return ResponseEntity.internalServerError()
                    .body("Failed to reject refund: " + e.getMessage());
        }
    }

    /**
     * Manual stock restore endpoint (keep for backwards compatibility)
     */
    @PostMapping("/refunds/restore-stock")
    public ResponseEntity<?> restoreStockAfterRefund(@RequestBody @Valid StockRestoreRequest request) {
        log.info("BFF: Restore stock after refund - productId: {}, quantity: {}",
                request.getProductId(), request.getQuantity());
        return ResponseEntity.ok(productService.restoreStock(request));
    }

    // ==================== HELPER METHODS ====================

    /**
     * Get comma-separated product names for an order
     */
    private String getProductNamesForOrder(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return "Order #" + order.getId();
        }

        List<String> names = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            try {
                Product product = productService.getProduct(item.getProductId());
                if (product != null && product.getName() != null) {
                    names.add(product.getName());
                } else {
                    names.add("Product #" + item.getProductId());
                }
            } catch (Exception e) {
                names.add("Product #" + item.getProductId());
            }
        }
        
        return names.isEmpty() ? "Order #" + order.getId() : String.join(", ", names);
    }
}