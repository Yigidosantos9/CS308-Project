package com.cs308.gateway.model.product;

import com.cs308.gateway.model.product.enums.Fit;
import com.cs308.gateway.model.product.enums.ProductType;
import com.cs308.gateway.model.product.enums.Season;
import com.cs308.gateway.model.product.enums.TargetAudience;
import com.cs308.gateway.model.product.enums.WarrantyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    private Long id;

    private String name;

    private Double price;

    private Double discountedPrice;

    private Double discountRate;

    private Integer stock;

    private String model;

    private String serialNumber;

    private String description;

    private String brand;

    private ProductType productType;

    private TargetAudience targetAudience;

    private WarrantyStatus warrantyStatus;

    private String distributorInfo;

    private Season season;

    private Fit fit;

    private String material;

    private String careInstructions;

    private boolean active = true;

    private Instant createdAt;

    private Instant updatedAt;

    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();
}
