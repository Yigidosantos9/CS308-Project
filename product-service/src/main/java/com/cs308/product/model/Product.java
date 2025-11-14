package com.cs308.product.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data                   // getter + setter + toString + equals/hashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder                // Product.builder() için
public class Product {

    private Long id;

    private String name;

    private String description;

    // 24900 = 249,00 TL
    private Long priceCents;

    private String currency;   // "TRY"

    private Integer stock;

    private String category;   // "tops", "pants", "shoes" ...

    // Opsiyonel ama e-ticaret için mantıklı alanlar:
    private String brand;      // "Nike", "Pull&Bear" ...
    private String color;      // "black", "white"
    private String gender;     // "women", "men", "unisex"

    private Double rating;

    private String imageUrl;
}