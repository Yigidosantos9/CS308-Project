package com.codingapp.autonextauthenticationapi.repository;

import com.codingapp.autonextauthenticationapi.domain.Product;
import com.codingapp.autonextauthenticationapi.domain.enums.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
        select distinct p
        from Product p
        where (:q is null
               or lower(p.name) like lower(concat('%', :q, '%'))
               or lower(p.model) like lower(concat('%', :q, '%'))
               or lower(p.brand) like lower(concat('%', :q, '%'))
               or lower(p.serialNumber) like lower(concat('%', :q, '%')))
          and (:productType is null or p.productType = :productType)
          and (:targetAudience is null or p.targetAudience = :targetAudience)
          and (:season is null or p.season = :season)
          and (:fit is null or p.fit = :fit)
          and (:warrantyStatus is null or p.warrantyStatus = :warrantyStatus)
          and (:active is null or p.active = :active)
        """)
    List<Product> search(
            @Param("q") String q,
            @Param("productType") ProductType productType,
            @Param("targetAudience") TargetAudience targetAudience,
            @Param("season") Season season,
            @Param("fit") Fit fit,
            @Param("warrantyStatus") WarrantyStatus warrantyStatus,
            @Param("active") Boolean active
    );
}