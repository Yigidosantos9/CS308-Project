package com.cs308.gateway.model.invoice;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundEmailRequest {

    @Email
    @NotBlank
    private String to;

    @NotNull
    private Long orderId;

    @NotNull
    private Double refundAmount;

    private String productName;
}
