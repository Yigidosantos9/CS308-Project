package com.cs308.gateway.service;

import com.cs308.gateway.client.OrderClient;
import com.cs308.gateway.model.invoice.InvoiceRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderClient orderClient;

    public byte[] generateInvoicePdf(InvoiceRequest request) {
        log.info("Processing invoice PDF generation for invoiceNumber: {}", request.getInvoiceNumber());
        return orderClient.generateInvoicePdf(request);
    }
}
