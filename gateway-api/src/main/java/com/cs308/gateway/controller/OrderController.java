package com.cs308.gateway.controller;

import com.cs308.gateway.model.auth.enums.UserType;
import com.cs308.gateway.model.product.Order;
import com.cs308.gateway.security.RequiresRole;
import com.cs308.gateway.security.SecurityContext;
import com.cs308.gateway.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Customers can place orders (must be authenticated)
    @PostMapping
    @RequiresRole({ UserType.CUSTOMER, UserType.PRODUCT_MANAGER })
    public ResponseEntity<Order> placeOrder(
            @AuthenticationPrincipal SecurityContext securityContext,
            @RequestBody(required = false) com.cs308.gateway.model.product.CreateOrderRequest request) {
        Long userId = securityContext.getUserId();
        String email = securityContext.getEmail();
        log.info("BFF: Place order request received from user: {}", userId);

        try {
            Order order = orderService.createOrder(userId, email, request);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            log.error("Error processing place order request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Customers can view their orders
    @GetMapping
    @RequiresRole({ UserType.CUSTOMER, UserType.PRODUCT_MANAGER })
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal SecurityContext securityContext) {
        Long userId = securityContext.getUserId();
        log.info("BFF: Get orders request received for user: {}", userId);

        try {
            List<Order> orders = orderService.getUserOrders(userId);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            log.error("Error processing get orders request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Customers can download invoice PDF for their orders
    @GetMapping(value = "/{orderId}/invoice", produces = MediaType.APPLICATION_PDF_VALUE)
    @RequiresRole({ UserType.CUSTOMER, UserType.PRODUCT_MANAGER })
    public ResponseEntity<ByteArrayResource> getOrderInvoice(
            @AuthenticationPrincipal SecurityContext securityContext,
            @PathVariable Long orderId,
            @RequestParam(required = false) String buyerName,
            @RequestParam(required = false) String buyerAddress,
            @RequestParam(required = false) String paymentMethod) {
        Long userId = securityContext.getUserId();
        log.info("BFF: Get invoice request - orderId: {}, userId: {}", orderId, userId);

        try {
            byte[] pdfBytes = orderService.getOrderInvoice(userId, orderId, buyerName, buyerAddress, paymentMethod);

            String filename = "invoice-order-" + orderId + ".pdf";
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
        } catch (RuntimeException e) {
            log.error("Error processing get invoice request", e);
            return ResponseEntity.internalServerError().build();
        }
    }


    // Product Manager can view all orders and update delivery status
    @GetMapping("/all")
    @RequiresRole({ UserType.PRODUCT_MANAGER })
    public ResponseEntity<List<Order>> getAllOrders() {
        log.info("BFF: Get all orders request received (Product Manager)");
        try {
            List<Order> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            log.error("Error processing get all orders request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Product Manager can update order status
    @PutMapping("/{orderId}/status")
    @RequiresRole({ UserType.PRODUCT_MANAGER })
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        log.info("BFF: Update order status request - orderId: {}, status: {}", orderId, status);
        try {
            orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error processing update order status request", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
