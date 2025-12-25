package com.cs308.gateway.client;

import com.cs308.gateway.model.invoice.InvoiceRequest;
import com.cs308.gateway.model.order.RefundReject;
import com.cs308.gateway.model.order.RefundRequest;
import com.cs308.gateway.model.product.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

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
                    .buildAndExpand(orderId)
                    .toUriString();

            Order order = orderRestTemplate.getForObject(uri, Order.class);
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

    public List<Order> getAllOrders() {
        log.debug("Calling order service: GET /orders/all");

        try {
            ResponseEntity<List<Order>> response = orderRestTemplate.exchange(
                    "/orders/all",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Order>>() {
                    });

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for get all orders", e);
            throw new RuntimeException("Failed to get all orders", e);
        }
    }

    // ==================== DATE RANGE QUERIES ====================

    /**
     * Get orders within a date range (for Sales Manager invoice filtering)
     */
    public List<Order> getOrdersByDateRange(String startDate, String endDate) {
        log.debug("Calling order service: GET /orders/date-range?startDate={}&endDate={}", startDate, endDate);

        try {
            String uri = UriComponentsBuilder.fromPath("/orders/date-range")
                    .queryParam("startDate", startDate)
                    .queryParam("endDate", endDate)
                    .toUriString();

            ResponseEntity<List<Order>> response = orderRestTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Order>>() {
                    });

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for get orders by date range", e);
            throw new RuntimeException("Failed to get orders by date range", e);
        }
    }

    public com.cs308.gateway.model.address.Address addAddress(Long userId,
            com.cs308.gateway.model.address.AddressRequest request) {
        log.debug("Calling order service: POST /addresses - userId: {}", userId);

        try {
            String uri = UriComponentsBuilder.fromPath("/api/addresses")
                    .queryParam("userId", userId)
                    .toUriString();

            return orderRestTemplate.postForObject(uri, request, com.cs308.gateway.model.address.Address.class);
        } catch (RestClientException e) {
            log.error("Error calling order service for add address", e);
            throw new RuntimeException("Failed to add address", e);
        }
    }

    public com.cs308.gateway.model.address.Address updateAddress(Long addressId,
            com.cs308.gateway.model.address.AddressRequest request) {
        log.debug("Calling order service: PUT /addresses/{}", addressId);

        try {
            String uri = UriComponentsBuilder.fromPath("/api/addresses/{addressId}")
                    .buildAndExpand(addressId)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            ResponseEntity<com.cs308.gateway.model.address.Address> response = orderRestTemplate.exchange(
                    uri,
                    HttpMethod.PUT,
                    new HttpEntity<>(request, headers),
                    com.cs308.gateway.model.address.Address.class);

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for update address", e);
            throw new RuntimeException("Failed to update address", e);
        }
    }

    public List<com.cs308.gateway.model.address.Address> getAddresses(Long userId) {
        log.debug("Calling order service: GET /addresses - userId: {}", userId);

        try {
            String uri = UriComponentsBuilder.fromPath("/api/addresses")
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
            String uri = UriComponentsBuilder.fromPath("/api/addresses/{addressId}")
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

    public byte[] getOrderInvoice(Long orderId, String buyerName, String buyerAddress, String paymentMethod) {
        log.debug("Calling order service: GET /orders/{}/invoice?buyerName={}, buyerAddress={}, paymentMethod={}",
                orderId,
                buyerName, buyerAddress, paymentMethod);

        try {
            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromPath("/orders/{orderId}/invoice");
            if (buyerName != null && !buyerName.isEmpty()) {
                uriBuilder.queryParam("buyerName", buyerName);
            }
            if (buyerAddress != null && !buyerAddress.isEmpty()) {
                uriBuilder.queryParam("buyerAddress", buyerAddress);
            }
            if (paymentMethod != null && !paymentMethod.isEmpty()) {
                uriBuilder.queryParam("paymentMethod", paymentMethod);
            }

            ResponseEntity<byte[]> response = orderRestTemplate.exchange(
                    uriBuilder.buildAndExpand(orderId).toUriString(),
                    HttpMethod.GET,
                    null,
                    byte[].class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for invoice", e);
            throw new RuntimeException("Failed to get invoice", e);
        }
    }

    // ==================== REFUND METHODS ====================

    /**
     * Request a refund for an order
     */
    public Order requestRefund(Long orderId, Long userId, RefundRequest request) {
        log.debug("Calling order service: POST /orders/{}/refund - userId: {}", orderId, userId);

        try {
            String uri = UriComponentsBuilder.fromPath("/orders/{orderId}/refund")
                    .queryParam("userId", userId)
                    .buildAndExpand(orderId)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            ResponseEntity<Order> response = orderRestTemplate.exchange(
                    uri,
                    HttpMethod.POST,
                    new HttpEntity<>(request, headers),
                    Order.class);

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for refund request", e);
            throw new RuntimeException("Failed to request refund", e);
        }
    }

    /**
     * Approve a refund request (PM action)
     */
    public Order approveRefund(Long orderId) {
        log.debug("Calling order service: PUT /orders/{}/refund/approve", orderId);

        try {
            String uri = UriComponentsBuilder.fromPath("/orders/{orderId}/refund/approve")
                    .buildAndExpand(orderId)
                    .toUriString();

            ResponseEntity<Order> response = orderRestTemplate.exchange(
                    uri,
                    HttpMethod.PUT,
                    null,
                    Order.class);

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for approve refund", e);
            throw new RuntimeException("Failed to approve refund", e);
        }
    }

    /**
     * Reject a refund request (PM action)
     */
    public Order rejectRefund(Long orderId, RefundReject request) {
        log.debug("Calling order service: PUT /orders/{}/refund/reject", orderId);

        try {
            String uri = UriComponentsBuilder.fromPath("/orders/{orderId}/refund/reject")
                    .buildAndExpand(orderId)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            ResponseEntity<Order> response = orderRestTemplate.exchange(
                    uri,
                    HttpMethod.PUT,
                    new HttpEntity<>(request, headers),
                    Order.class);

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for reject refund", e);
            throw new RuntimeException("Failed to reject refund", e);
        }
    }

    /**
     * Get all pending refund requests (for PM dashboard)
     */
    public List<Order> getPendingRefundRequests() {
        log.debug("Calling order service: GET /orders/refunds/pending");

        try {
            ResponseEntity<List<Order>> response = orderRestTemplate.exchange(
                    "/orders/refunds/pending",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Order>>() {
                    });

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for pending refund requests", e);
            throw new RuntimeException("Failed to get pending refund requests", e);
        }
    }

    /**
     * Get count of pending refund requests
     */
    public Long getPendingRefundCount() {
        log.debug("Calling order service: GET /orders/refunds/pending/count");

        try {
            ResponseEntity<Map<String, Long>> response = orderRestTemplate.exchange(
                    "/orders/refunds/pending/count",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Long>>() {
                    });

            Map<String, Long> body = response.getBody();
            return body != null ? body.get("count") : 0L;
        } catch (RestClientException e) {
            log.error("Error calling order service for pending refund count", e);
            return 0L;
        }
    }

    /**
     * Check if an order is eligible for refund
     */
    public Map<String, Object> checkRefundEligibility(Long orderId, Long userId) {
        log.debug("Calling order service: GET /orders/{}/refund/eligibility - userId: {}", orderId, userId);

        try {
            String uri = UriComponentsBuilder.fromPath("/orders/{orderId}/refund/eligibility")
                    .queryParam("userId", userId)
                    .buildAndExpand(orderId)
                    .toUriString();

            ResponseEntity<Map<String, Object>> response = orderRestTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for refund eligibility check", e);
            throw new RuntimeException("Failed to check refund eligibility", e);
        }
    }

    // ==================== CANCEL ORDER METHODS ====================

    /**
     * Cancel an order (only for PROCESSING/PREPARING orders)
     */
    public Order cancelOrder(Long orderId, Long userId) {
        log.debug("Calling order service: POST /orders/{}/cancel - userId: {}", orderId, userId);

        try {
            String uri = UriComponentsBuilder.fromPath("/orders/{orderId}/cancel")
                    .queryParam("userId", userId)
                    .buildAndExpand(orderId)
                    .toUriString();

            ResponseEntity<Order> response = orderRestTemplate.exchange(
                    uri,
                    HttpMethod.POST,
                    null,
                    Order.class);

            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling order service for cancel order", e);
            String errorMessage = "Failed to cancel order";
            if (e instanceof org.springframework.web.client.HttpClientErrorException) {
                org.springframework.web.client.HttpClientErrorException httpError = (org.springframework.web.client.HttpClientErrorException) e;
                String body = httpError.getResponseBodyAsString();
                if (body != null && body.contains("error")) {
                    errorMessage = body;
                }
            }
            throw new RuntimeException(errorMessage, e);
        }
    }
}