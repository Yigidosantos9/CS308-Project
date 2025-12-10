package com.cs308.product.model;

import com.cs308.product.domain.enums.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateProductRequest {

    @NotBlank
    private String name;

    @NotNull
    private Double price;

    @NotNull
    private Integer stock;

    @NotBlank
    private String model;

    @NotBlank
    private String serialNumber;

    @NotBlank
    private String description;

    private String brand;

    @NotNull
    private ProductType productType;

    @NotNull
    private TargetAudience targetAudience;

    @NotNull
    private WarrantyStatus warrantyStatus;

    @NotBlank
    private String distributorInfo;

    private Season season;

    private Fit fit;

    private String material;

    private String careInstructions;

    private Boolean active = true;

    private java.util.List<String> imageUrls;
}
