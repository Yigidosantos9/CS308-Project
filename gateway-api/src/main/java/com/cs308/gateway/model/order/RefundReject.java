package com.cs308.gateway.model.order;

import jakarta.validation.constraints.Size;

public class RefundReject {

    @Size(max = 1000, message = "Rejection reason must be less than 1000 characters")
    private String reason;

    public RefundReject() {
    }

    public RefundReject(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}