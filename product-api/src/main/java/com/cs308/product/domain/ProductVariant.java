package com.cs308.product.domain;

import com.codingapp.autonextauthenticationapi.domain.enums.Color;
import com.codingapp.autonextauthenticationapi.domain.enums.Size;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@Entity
@Table(
        name = "product_variants",
        uniqueConstraints = {
                @UniqueConstraint(name = "uc_product_color_size", columnNames = {"product_id", "color", "size"})
        },
        indexes = {
                @Index(name = "idx_variant_sku", columnList = "sku"),
                @Index(name = "idx_variant_barcode", columnList = "barcode"),
                @Index(name = "idx_variant_sellable", columnList = "is_sellable")
        }
)
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which variant of product
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @ToString.Exclude
    @JsonIgnore   // JSON infinite recursion'ı engelliyor
    private Product product;

    // Operational key
    @NotBlank
    @Column(nullable = false, unique = true, length = 64)
    private String sku;            // örn: SW-2401-BLACK-M

    @Column(length = 64, unique = true)
    private String barcode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private Color color;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private Size size;             // XS–XXL

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private Integer stockQuantity = 0;

    @NotNull
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @DecimalMin("0.00")
    @Column(precision = 12, scale = 2)
    private BigDecimal discountedPrice; // null => no discount

    @Column(name = "is_sellable", nullable = false)
    private boolean sellable = true;    // yayın/publish kontrolü
}