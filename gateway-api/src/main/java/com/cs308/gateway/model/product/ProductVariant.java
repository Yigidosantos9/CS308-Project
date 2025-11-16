package com.cs308.gateway.model.product;

import com.cs308.gateway.model.product.enums.Color;
import com.cs308.gateway.model.product.enums.Size;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    private Long id;

    @JsonIgnore
    private Product product;

    private String sku;

    private String barcode;

    private Color color;

    private Size size;

    private Integer stockQuantity = 0;

    private BigDecimal price;

    private BigDecimal discountedPrice;

    private boolean sellable = true;
}

