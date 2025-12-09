package com.cs308.order.controller;

import com.cs308.order.model.Order;
import com.cs308.order.model.InvoiceRequest;
import com.cs308.order.model.InvoiceItem;
import com.cs308.order.service.OrderService;
import com.cs308.order.service.InvoicePdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
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

    @GetMapping(value = "/{id}/invoice", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<ByteArrayResource> getInvoice(@PathVariable Long id) {
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
            invoiceRequest.setBuyerName("Customer #" + order.getUserId());
            invoiceRequest.setBuyerAddress("Address on file");
            invoiceRequest.setSellerName("RAWCTRL Store");
            invoiceRequest.setSellerAddress("Istanbul, Turkey");
            invoiceRequest.setTaxRate(0.18); // 18% VAT
            invoiceRequest.setShippingFee(0.0);
            invoiceRequest.setCurrencySymbol("$");

            // Convert order items to invoice items
            // Prices are VAT-inclusive, so divide by 1.18 to get net price for invoice
            List<InvoiceItem> invoiceItems = order.getItems().stream()
                    .map(item -> {
                        InvoiceItem invoiceItem = new InvoiceItem();
                        invoiceItem.setDescription("Product #" + item.getProductId());
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
