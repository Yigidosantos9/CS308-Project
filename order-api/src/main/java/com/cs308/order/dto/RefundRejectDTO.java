package com.cs308.order.dto;

import jakarta.validation.constraints.Size;

public class RefundRejectDTO {

    @Size(max = 1000, message = "Rejection reason must be less than 1000 characters")
    private String reason;

    public RefundRejectDTO() {
    }

    public RefundRejectDTO(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}