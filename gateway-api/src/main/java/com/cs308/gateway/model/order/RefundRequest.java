package com.cs308.gateway.model.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RefundRequest {

    @NotBlank(message = "Refund reason is required")
    @Size(min = 10, max = 1000, message = "Refund reason must be between 10 and 1000 characters")
    private String reason;

    public RefundRequest() {
    }

    public RefundRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}