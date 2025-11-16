package com.cs308.gateway.controller;

import com.cs308.gateway.model.auth.enums.UserType;
import com.cs308.gateway.security.RequiresRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/sales")
@RequiresRole({UserType.SALES_MANAGER}) // All endpoints require Sales Manager role
@RequiredArgsConstructor
public class SalesManagerController {

    // Sales Manager can set product prices
    @PutMapping("/products/{productId}/price")
    public ResponseEntity<?> setProductPrice(
            @PathVariable Long productId, 
            @RequestParam Double price) {
        log.info("BFF: Set product price request - productId: {}, price: {}", productId, price);
        // TODO: Implement set price
        return ResponseEntity.ok().build();
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

    // Sales Manager can calculate revenue and profit
    @GetMapping("/revenue")
    public ResponseEntity<?> calculateRevenue(
            @RequestParam String startDate, 
            @RequestParam String endDate) {
        log.info("BFF: Calculate revenue request - startDate: {}, endDate: {}", startDate, endDate);
        // TODO: Implement calculate revenue
        return ResponseEntity.ok().build();
    }

    // Sales Manager can evaluate refund requests
    @PutMapping("/refunds/{refundId}/approve")
    public ResponseEntity<?> approveRefund(@PathVariable Long refundId) {
        log.info("BFF: Approve refund request - refundId: {}", refundId);
        // TODO: Implement approve refund
        return ResponseEntity.ok().build();
    }

    @PutMapping("/refunds/{refundId}/reject")
    public ResponseEntity<?> rejectRefund(@PathVariable Long refundId) {
        log.info("BFF: Reject refund request - refundId: {}", refundId);
        // TODO: Implement reject refund
        return ResponseEntity.ok().build();
    }
}

