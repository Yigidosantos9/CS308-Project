package com.cs308.gateway.model.invoice;

import jakarta.validation.Valid;
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
public class InvoiceEmailRequest {

    @Email
    @NotBlank
    private String to;

    private String subject;

    private String body;

    @NotNull
    @Valid
    private InvoiceRequest invoice;
}


