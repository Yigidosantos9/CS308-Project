package com.cs308.order.model.enums;

public enum RefundStatus {
    NONE,           // No refund requested
    PENDING,        // Refund requested, awaiting PM decision
    APPROVED,       // Refund approved by PM
    REJECTED        // Refund rejected by PM
}