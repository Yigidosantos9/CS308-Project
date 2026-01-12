package com.cs308.gateway.model.product;

import com.cs308.gateway.model.product.enums.Fit;
import com.cs308.gateway.model.product.enums.ProductType;
import com.cs308.gateway.model.product.enums.Season;
import com.cs308.gateway.model.product.enums.TargetAudience;
import com.cs308.gateway.model.product.enums.WarrantyStatus;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for updating an existing product (Product Manager action).
 * All fields are optional - only non-null fields will be updated.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {

    private String name;

    @Positive(message = "Price must be positive")
    private Double price;

    @PositiveOrZero(message = "Stock cannot be negative")
    private Integer stock;

    private String model;

    private String serialNumber;

    private String description;

    private String brand;

    private String productType;

    private TargetAudience targetAudience;

    private WarrantyStatus warrantyStatus;

    private String distributorInfo;

    private Season season;

    private Fit fit;

    private String material;

    private String careInstructions;

    private Boolean active;

    private List<String> imageUrls;
}
