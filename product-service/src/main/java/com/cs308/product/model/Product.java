package com.cs308.product.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @NotNull
    private Long id;

    @NotBlank
    private String name;

    private String description;

    @NotNull @Min(0)
    private Long priceCents;

    @NotBlank
    private String currency; // e.g., "TRY", "USD"

    @NotNull @Min(0)
    private Integer stock;

    @NotBlank
    private String category;

    private String imageUrl;
    private Double rating; // average rating 0..5
}
