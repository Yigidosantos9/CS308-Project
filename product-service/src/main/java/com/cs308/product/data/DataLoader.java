package com.cs308.product.data;

import com.cs308.product.model.Product;
import com.cs308.product.repo.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Profile("!test")
public class DataLoader implements CommandLineRunner {

    private final ProductRepository repo;

    @Override
    public void run(String... args) {
        if (!repo.isEmpty()) return;
        repo.saveAll(List.of(
    Product.builder()
            .id(1L)
            .name("2018 BMW 320i")
            .description("62.000 km • Otomatik • Benzin • İstanbul")
            .priceCents(1250000L)
            .currency("TRY")
            .stock(1)
            .category("cars")
            .imageUrl(null)
            .rating(4.7)
            .build(),
    Product.builder()
            .id(2L)
            .name("2020 Toyota Corolla 1.5 Vision")
            .description("45.500 km • Manuel • Benzin • Ankara")
            .priceCents(850000L)
            .currency("TRY")
            .stock(1)
            .category("cars")
            .imageUrl(null)
            .rating(4.6)
            .build(),
    Product.builder()
            .id(3L)
            .name("2019 Volkswagen Golf 1.4 TSI")
            .description("78.000 km • Otomatik • Benzin • İzmir")
            .priceCents(980000L)
            .currency("TRY")
            .stock(1)
            .category("cars")
            .imageUrl(null)
            .rating(4.5)
            .build(),
    Product.builder()
            .id(4L)
            .name("2021 Renault Clio 1.0 TCe")
            .description("32.000 km • Manuel • Benzin • Bursa")
            .priceCents(690000L)
            .currency("TRY")
            .stock(1)
            .category("cars")
            .imageUrl(null)
            .rating(4.4)
            .build()
));
    }
}
