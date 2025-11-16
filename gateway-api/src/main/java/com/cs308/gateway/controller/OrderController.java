package com.cs308.gateway.controller;

import com.cs308.gateway.model.auth.enums.UserType;
import com.cs308.gateway.security.RequiresRole;
import com.cs308.gateway.security.SecurityContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    // Customers can place orders (must be authenticated)
    @PostMapping
    @RequiresRole({UserType.CUSTOMER})
    public ResponseEntity<?> placeOrder(@RequestBody Object orderRequest) {
        log.info("BFF: Place order request received from user: {}", 
                SecurityContext.getContext().getUserId());
        // TODO: Implement place order
        return ResponseEntity.ok().build();
    }

    // Customers can view their orders
    @GetMapping
    @RequiresRole({UserType.CUSTOMER})
    public ResponseEntity<?> getMyOrders() {
        Long userId = SecurityContext.getContext().getUserId();
        log.info("BFF: Get orders request received for user: {}", userId);
        // TODO: Implement get orders
        return ResponseEntity.ok().build();
    }

    // Customers can cancel orders (only if in "processing" status)
    @PostMapping("/{orderId}/cancel")
    @RequiresRole({UserType.CUSTOMER})
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        Long userId = SecurityContext.getContext().getUserId();
        log.info("BFF: Cancel order request received - orderId: {}, userId: {}", orderId, userId);
        // TODO: Implement cancel order
        return ResponseEntity.ok().build();
    }

    // Customers can return products (only if delivered)
    @PostMapping("/{orderId}/return")
    @RequiresRole({UserType.CUSTOMER})
    public ResponseEntity<?> returnProduct(@PathVariable Long orderId, @RequestParam Long productId) {
        Long userId = SecurityContext.getContext().getUserId();
        log.info("BFF: Return product request - orderId: {}, productId: {}, userId: {}", 
                orderId, productId, userId);
        // TODO: Implement return product
        return ResponseEntity.ok().build();
    }

    // Product Manager can view all orders and update delivery status
    @GetMapping("/all")
    @RequiresRole({UserType.PRODUCT_MANAGER})
    public ResponseEntity<?> getAllOrders() {
        log.info("BFF: Get all orders request received (Product Manager)");
        // TODO: Implement get all orders
        return ResponseEntity.ok().build();
    }

    // Product Manager can update order status
    @PutMapping("/{orderId}/status")
    @RequiresRole({UserType.PRODUCT_MANAGER})
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId, 
            @RequestParam String status) {
        log.info("BFF: Update order status request - orderId: {}, status: {}", orderId, status);
        // TODO: Implement update order status
        return ResponseEntity.ok().build();
    }
}

