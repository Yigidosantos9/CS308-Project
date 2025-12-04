package com.cs308.order.service;

import com.cs308.order.model.PaymentRequest;
import com.cs308.order.model.PaymentResponse;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PaymentServiceTest {

    private final PaymentService paymentService = new PaymentService();

    @Test
    void processPayment_Success() {
        PaymentRequest request = new PaymentRequest("1234567890123456", "12/25", "123", 100.0);
        PaymentResponse response = paymentService.processPayment(request);

        assertEquals("SUCCESS", response.getStatus());
        assertNotNull(response.getTransactionId());
        assertEquals("Payment processed successfully", response.getMessage());
    }

    @Test
    void processPayment_Failure_NegativeAmount() {
        PaymentRequest request = new PaymentRequest("1234567890123456", "12/25", "123", -50.0);
        PaymentResponse response = paymentService.processPayment(request);

        assertEquals("FAILED", response.getStatus());
        assertNull(response.getTransactionId());
        assertEquals("Invalid amount", response.getMessage());
    }
}
