package com.cs308.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RefundRequestDTO {

    @NotBlank(message = "Refund reason is required")
    @Size(min = 10, max = 1000, message = "Refund reason must be between 10 and 1000 characters")
    private String reason;

    public RefundRequestDTO() {
    }

    public RefundRequestDTO(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}