package com.cs308.gateway.client;

import com.cs308.gateway.model.invoice.InvoiceRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderClient {

    @Qualifier("orderRestTemplate")
    private final RestTemplate orderRestTemplate;

    public byte[] generateInvoicePdf(InvoiceRequest request) {
        log.debug("Calling order service: POST /invoices/pdf for invoice {}", request.getInvoiceNumber());

        try {
            ResponseEntity<byte[]> response = orderRestTemplate.postForEntity(
                    "/invoices/pdf",
                    request,
                    byte[].class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for invoice pdf generation", e);
            throw new RuntimeException("Failed to generate invoice PDF", e);
        }
    }

    public Object getOrdersByUserId(Long userId) {
        log.debug("Calling order service: GET /orders?userId={}", userId);

        try {
            ResponseEntity<Object> response = orderRestTemplate.getForEntity(
                    "/orders?userId=" + userId,
                    Object.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for fetching orders", e);
            throw new RuntimeException("Failed to fetch orders", e);
        }
    }
}
