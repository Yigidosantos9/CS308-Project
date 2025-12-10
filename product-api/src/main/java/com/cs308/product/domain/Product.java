package com.cs308.product.domain;

import com.cs308.product.domain.enums.Fit;
import com.cs308.product.domain.enums.ProductType;
import com.cs308.product.domain.enums.Season;
import com.cs308.product.domain.enums.TargetAudience;
import com.cs308.product.domain.enums.WarrantyStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@Entity
// ⚠️ IMPORTANT: Required for distinct() in Service to work
@EqualsAndHashCode(onlyExplicitlyIncluded = true) 
@Table(name = "products", indexes = {
        @Index(name = "idx_products_name", columnList = "name"),
        @Index(name = "idx_products_model", columnList = "model"),
        @Index(name = "idx_products_type_audience", columnList = "product_type,target_audience"),
        // Optimized index for rating sorting
        @Index(name = "idx_products_rating", columnList = "review_count, average_rating") 
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include // Identity is based only on ID
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String name;

    @NotNull
    @Column(nullable = false)
    private Double price;

    @NotNull
    @Column(nullable = false)
    private Integer stock;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String model;

    @NotBlank
    @Column(nullable = false, length = 120)
    private String serialNumber;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String brand;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 40)
    private ProductType productType;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_audience", nullable = false, length = 16)
    private TargetAudience targetAudience;

    @Enumerated(EnumType.STRING)
    @Column(name = "warranty_status", nullable = false, length = 16)
    private WarrantyStatus warrantyStatus;

    @NotBlank
    @Column(name = "distributor_info", nullable = false, columnDefinition = "TEXT")
    private String distributorInfo;

    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private Season season;

    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private Fit fit;

    @Column(length = 120)
    private String material;

    @Column(columnDefinition = "TEXT")
    private String careInstructions;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "sales_count")
    @Builder.Default
    private Integer salesCount = 0;

    // Fields populated by ReviewService
    @Column(name = "average_rating")
    @Builder.Default
    private Double averageRating = 0.0;

    @Column(name = "review_count")
    @Builder.Default
    private Long reviewCount = 0L;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    private List<ProductVariant> variants = new ArrayList<>();
}