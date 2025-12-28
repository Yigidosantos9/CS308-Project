package com.cs308.gateway.model.product;

import com.cs308.gateway.model.product.enums.Fit;
import com.cs308.gateway.model.product.enums.ProductType;
import com.cs308.gateway.model.product.enums.Season;
import com.cs308.gateway.model.product.enums.TargetAudience;
import com.cs308.gateway.model.product.enums.WarrantyStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for creating a new product (Product Manager action)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;

    @NotNull(message = "Stock is required")
    @PositiveOrZero(message = "Stock cannot be negative")
    private Integer stock;

    @NotBlank(message = "Model is required")
    private String model;

    @NotBlank(message = "Serial number is required")
    private String serialNumber;

    @NotBlank(message = "Description is required")
    private String description;

    private String brand;

    @NotNull(message = "Product type is required")
    private ProductType productType;

    @NotNull(message = "Target audience is required")
    private TargetAudience targetAudience;

    @NotNull(message = "Warranty status is required")
    private WarrantyStatus warrantyStatus;

    @NotBlank(message = "Distributor info is required")
    private String distributorInfo;

    private Season season;

    private Fit fit;

    private String material;

    private String careInstructions;

    @Builder.Default
    private Boolean active = true;

    private List<String> imageUrls;
}
