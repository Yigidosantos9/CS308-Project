package com.cs308.gateway.model.invoice;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceRequest {

    @NotBlank
    private String invoiceNumber;

    @NotBlank
    private String issueDate;

    @NotBlank
    private String dueDate;

    @NotBlank
    private String sellerName;

    @NotBlank
    private String sellerAddress;

    @NotBlank
    private String buyerName;

    @NotBlank
    private String buyerAddress;

    @NotNull
    @Builder.Default
    private Double taxRate = 0.0;

    @Builder.Default
    private Double shippingFee = 0.0;

    @Builder.Default
    private String currencySymbol = "$";

    @Valid
    @NotEmpty
    @Builder.Default
    private List<InvoiceItem> items = new ArrayList<>();
}
