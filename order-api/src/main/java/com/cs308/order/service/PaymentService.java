package com.cs308.order.service;

import com.cs308.order.model.PaymentRequest;
import com.cs308.order.model.PaymentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("Processing payment for amount: {}", request.getAmount());

        // Mock logic: Fail if amount is negative
        if (request.getAmount() < 0) {
            return new PaymentResponse("FAILED", null, "Invalid amount");
        }

        // Mock logic: Always succeed for positive amounts
        String transactionId = UUID.randomUUID().toString();
        return new PaymentResponse("SUCCESS", transactionId, "Payment processed successfully");
    }
}
