package com.cs308.gateway.controller;

import com.cs308.gateway.model.auth.enums.UserType;
import com.cs308.gateway.security.RequiresRole;
import com.cs308.gateway.model.invoice.InvoiceRequest;
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

@Slf4j
@RestController
@RequestMapping("/api/sales")
@RequiresRole({UserType.SALES_MANAGER}) // All endpoints require Sales Manager role
@RequiredArgsConstructor
public class SalesManagerController {

    private final OrderService orderService;
    private final ProductService productService;

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
