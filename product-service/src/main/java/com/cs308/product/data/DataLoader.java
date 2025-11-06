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
                Product.builder().id(1L).name("iPhone 14").description("128GB Midnight").priceCents(499900L)
                        .currency("TRY").stock(12).category("electronics").imageUrl(null).rating(4.7).build(),
                Product.builder().id(2L).name("Samsung Galaxy S23").description("256GB Phantom Black").priceCents(429900L)
                        .currency("TRY").stock(18).category("electronics").imageUrl(null).rating(4.6).build(),
                Product.builder().id(3L).name("MacBook Air M2").description("8GB 256GB").priceCents(799900L)
                        .currency("TRY").stock(7).category("computers").imageUrl(null).rating(4.8).build(),
                Product.builder().id(4L).name("AirPods Pro").description("2nd Gen").priceCents(99900L)
                        .currency("TRY").stock(30).category("electronics").imageUrl(null).rating(4.5).build()
        ));
    }
}
