package com.cs308.product.repository;

import com.cs308.product.domain.Product;
import com.cs308.product.domain.enums.Color;
import com.cs308.product.domain.enums.ProductType;
import com.cs308.product.domain.enums.TargetAudience;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT DISTINCT p FROM Product p " +
            "LEFT JOIN p.variants v " +
            "WHERE (:qPattern IS NULL OR LOWER(p.name) LIKE :qPattern " +
            "OR LOWER(p.description) LIKE :qPattern " +
            "OR LOWER(p.brand) LIKE :qPattern) " +
            "AND (:productType IS NULL OR p.productType = :productType) " +
            "AND (:targetAudience IS NULL OR p.targetAudience = :targetAudience) " +
            "AND (:color IS NULL OR v.color = :color) " +
            "AND (:descriptionPattern IS NULL OR LOWER(p.description) LIKE :descriptionPattern)")
    List<Product> search(@Param("qPattern") String qPattern,
                         @Param("productType") ProductType productType,
                         @Param("targetAudience") TargetAudience targetAudience,
                         @Param("color") Color color,
                         @Param("descriptionPattern") String descriptionPattern,
                         Sort sort);
}
