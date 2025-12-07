package com.cs308.gateway.client;

import com.cs308.gateway.model.invoice.InvoiceRequest;
import com.cs308.gateway.model.product.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

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

    public Order createOrder(Long userId, com.cs308.gateway.model.product.CreateOrderRequest request) {
        log.debug("Calling order service: POST /orders - userId: {}", userId);

        try {
            String uri = UriComponentsBuilder.fromPath("/orders")
                    .queryParam("userId", userId)
                    .toUriString();

            Order order = orderRestTemplate.postForObject(uri, request, Order.class);
            return order;
        } catch (RestClientException e) {
            log.error("Error calling order service for create order", e);
            throw new RuntimeException("Failed to create order", e);
        }
    }

    public Order getOrder(Long orderId, Long userId) {
        log.debug("Calling order service: GET /orders/{} - userId: {}", orderId, userId);

        try {
            String uri = UriComponentsBuilder.fromPath("/orders/{orderId}")
                    .queryParam("userId", userId)
                    .toUriString();

            Order order = orderRestTemplate.getForObject(uri, Order.class, orderId);
            return order;
        } catch (RestClientException e) {
            log.error("Error calling order service for get order", e);
            throw new RuntimeException("Failed to get order", e);
        }
    }

    public List<Order> getUserOrders(Long userId) {
        log.debug("Calling order service: GET /orders - userId: {}", userId);

        try {
            String uri = UriComponentsBuilder.fromPath("/orders")
                    .queryParam("userId", userId)
                    .toUriString();

            ResponseEntity<List<Order>> response = orderRestTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Order>>() {
                    });

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for get user orders", e);
            throw new RuntimeException("Failed to get user orders", e);
        }
    }

    public com.cs308.gateway.model.address.Address addAddress(Long userId,
            com.cs308.gateway.model.address.AddressRequest request) {
        log.debug("Calling order service: POST /addresses - userId: {}", userId);

        try {
            String uri = UriComponentsBuilder.fromPath("/addresses")
                    .queryParam("userId", userId)
                    .toUriString();

            return orderRestTemplate.postForObject(uri, request, com.cs308.gateway.model.address.Address.class);
        } catch (RestClientException e) {
            log.error("Error calling order service for add address", e);
            throw new RuntimeException("Failed to add address", e);
        }
    }

    public List<com.cs308.gateway.model.address.Address> getAddresses(Long userId) {
        log.debug("Calling order service: GET /addresses - userId: {}", userId);

        try {
            String uri = UriComponentsBuilder.fromPath("/addresses")
                    .queryParam("userId", userId)
                    .toUriString();

            ResponseEntity<List<com.cs308.gateway.model.address.Address>> response = orderRestTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<com.cs308.gateway.model.address.Address>>() {
                    });

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for get addresses", e);
            throw new RuntimeException("Failed to get addresses", e);
        }
    }

    public void deleteAddress(Long addressId) {
        log.debug("Calling order service: DELETE /addresses/{}", addressId);

        try {
            String uri = UriComponentsBuilder.fromPath("/addresses/{addressId}")
                    .buildAndExpand(addressId)
                    .toUriString();

            orderRestTemplate.delete(uri);
        } catch (RestClientException e) {
            log.error("Error calling order service for delete address", e);
            throw new RuntimeException("Failed to delete address", e);
        }
    }

    public void updateOrderStatus(Long orderId, String status) {
        log.debug("Calling order service: PUT /orders/{}/status?status={}", orderId, status);

        try {
            String uri = UriComponentsBuilder.fromPath("/orders/{orderId}/status")
                    .queryParam("status", status)
                    .buildAndExpand(orderId)
                    .toUriString();

            orderRestTemplate.put(uri, null);
        } catch (RestClientException e) {
            log.error("Error calling order service for update order status", e);
            throw new RuntimeException("Failed to update order status", e);
        }
    }

    public byte[] getOrderInvoice(Long orderId) {
        log.debug("Calling order service: GET /orders/{}/invoice", orderId);

        try {
            ResponseEntity<byte[]> response = orderRestTemplate.exchange(
                    "/orders/{orderId}/invoice",
                    HttpMethod.GET,
                    null,
                    byte[].class,
                    orderId);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for invoice", e);
            throw new RuntimeException("Failed to get invoice", e);
        }
    }
}
