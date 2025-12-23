package com.cs308.gateway.controller;

import com.cs308.gateway.client.OrderClient;
import com.cs308.gateway.model.auth.enums.UserType;
import com.cs308.gateway.model.order.RefundRequest;
import com.cs308.gateway.model.product.Order;
import com.cs308.gateway.security.RequiresRole;
import com.cs308.gateway.security.SecurityContext;
import com.cs308.gateway.service.InvoiceEmailService;
import com.cs308.gateway.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Customer-facing endpoints for refund requests.
 * Customers can request refunds on their delivered orders within the refund window.
 * 
 * Note: Sales Manager refund approval/rejection endpoints are in SalesManagerController.
 */
@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class RefundController {

    private final OrderClient orderClient;
    private final InvoiceEmailService invoiceEmailService;
    private final ProductService productService;

    /**
     * Request a refund for an order (Customer action)
     * POST /api/orders/{orderId}/refund
     */
    @PostMapping("/{orderId}/refund")
    @RequiresRole({ UserType.CUSTOMER })
    public ResponseEntity<?> requestRefund(
            @AuthenticationPrincipal SecurityContext securityContext,
            @PathVariable Long orderId,
            @Valid @RequestBody RefundRequest request) {
        
        Long userId = securityContext.getUserId();
        String email = securityContext.getEmail();
        
        log.info("BFF: Refund request - orderId: {}, userId: {}", orderId, userId);

        try {
            Order order = orderClient.requestRefund(orderId, userId, request);
            
            // Optionally send confirmation email
            try {
                if (email != null) {
                    String productNames = getProductNamesForOrder(order);
                    invoiceEmailService.sendRefundRequestConfirmationEmail(email, orderId, productNames);
                }
            } catch (Exception e) {
                log.warn("Failed to send refund request confirmation email", e);
                // Don't fail the request
            }

            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("Failed to request refund for order {}", orderId, e);
            String message = e.getMessage();
            if (message != null && message.contains("Failed to request refund")) {
                return ResponseEntity.badRequest().body(Map.of("error", message));
            }
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to request refund: " + message));
        }
    }

    /**
     * Check refund eligibility for an order (Customer action)
     * GET /api/orders/{orderId}/refund/eligibility
     */
    @GetMapping("/{orderId}/refund/eligibility")
    @RequiresRole({ UserType.CUSTOMER })
    public ResponseEntity<?> checkRefundEligibility(
            @AuthenticationPrincipal SecurityContext securityContext,
            @PathVariable Long orderId) {
        
        Long userId = securityContext.getUserId();
        
        log.info("BFF: Check refund eligibility - orderId: {}, userId: {}", orderId, userId);

        try {
            Map<String, Object> eligibility = orderClient.checkRefundEligibility(orderId, userId);
            return ResponseEntity.ok(eligibility);
        } catch (Exception e) {
            log.error("Failed to check refund eligibility for order {}", orderId, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("eligible", false, "reason", "Failed to check eligibility"));
        }
    }

    /**
     * Cancel an order (Customer action - only for PROCESSING/PREPARING orders)
     * POST /api/orders/{orderId}/cancel
     */
    @PostMapping("/{orderId}/cancel")
    @RequiresRole({ UserType.CUSTOMER })
 public ResponseEntity<?> cancelOrder(
            @AuthenticationPrincipal SecurityContext securityContext,
            @PathVariable Long orderId) {
        
        Long userId = securityContext.getUserId();
        log.info("GATEWAY RECEIVE: Cancel request for Order {} from User {}", orderId, userId);

        try {
            // This MUST call the Gateway OrderService, which calls OrderClient
            Order order = orderClient.cancelOrder(orderId, userId); 
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("GATEWAY ERROR: Cancel failed", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    /**
     * Get comma-separated product names for an order
     */
    private String getProductNamesForOrder(Order order) {
        if (order == null || order.getItems() == null || order.getItems().isEmpty()) {
            return "Order #" + (order != null ? order.getId() : "Unknown");
        }

        List<String> names = new ArrayList<>();
        for (com.cs308.gateway.model.product.OrderItem item : order.getItems()) {
            try {
                com.cs308.gateway.model.product.Product product = 
                        productService.getProduct(item.getProductId());
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