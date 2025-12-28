package com.cs308.product.model;

import com.cs308.product.domain.enums.Fit;
import com.cs308.product.domain.enums.ProductType;
import com.cs308.product.domain.enums.Season;
import com.cs308.product.domain.enums.TargetAudience;
import com.cs308.product.domain.enums.WarrantyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {

    private String name;
    private Double price;
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
    private Boolean active;
    private java.util.List<String> imageUrls;
}
