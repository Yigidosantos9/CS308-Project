package com.cs308.product.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockRestoreRequest {

    @NotNull
    private Long productId;

    /**
     * Quantity to restore (e.g., the refunded quantity).
     */
    @NotNull
    @Min(1)
    private Integer quantity;
}


