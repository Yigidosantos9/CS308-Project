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
@Profile("!test")   // test ortamında çalışmasın
public class DataLoader implements CommandLineRunner {

    private final ProductRepository repo;

    @Override
    public void run(String... args) {
        // Eğer zaten ürün varsa seed etme
        if (!repo.isEmpty()) {
            return;
        }

        List<Product> products = List.of(
                Product.builder()
                        .id(1L)
                        .name("Oversize Basic T-Shirt")
                        .description("Unisex • %100 pamuk • Beyaz")
                        .priceCents(24900L)        // 249,00 TL
                        .currency("TRY")
                        .stock(50)
                        .category("tops")
                        .brand("BasicLab")
                        .color("white")
                        .gender("unisex")
                        .rating(4.7)
                        .imageUrl(null)
                        .build(),

                Product.builder()
                        .id(2L)
                        .name("High-Waist Straight Jean")
                        .description("Kadın • Mavi • Yüksek bel")
                        .priceCents(45900L)
                        .currency("TRY")
                        .stock(35)
                        .category("pants")
                        .brand("Denim&Co")
                        .color("blue")
                        .gender("women")
                        .rating(4.6)
                        .imageUrl(null)
                        .build(),

                Product.builder()
                        .id(3L)
                        .name("Hoodie Sweatshirt")
                        .description("Unisex • Kapüşonlu • Siyah")
                        .priceCents(39900L)
                        .currency("TRY")
                        .stock(40)
                        .category("hoodies")
                        .brand("UrbanWear")
                        .color("black")
                        .gender("unisex")
                        .rating(4.5)
                        .imageUrl(null)
                        .build(),

                Product.builder()
                        .id(4L)
                        .name("Chunky Sneakers")
                        .description("Unisex • Beyaz • Kalın taban")
                        .priceCents(69900L)
                        .currency("TRY")
                        .stock(25)
                        .category("shoes")
                        .brand("StreetStep")
                        .color("white")
                        .gender("unisex")
                        .rating(4.8)
                        .imageUrl(null)
                        .build(),

                Product.builder()
                        .id(5L)
                        .name("Basic Crew Socks (3'lü Paket)")
                        .description("Pamuk karışımlı • Günlük kullanım")
                        .priceCents(9900L)
                        .currency("TRY")
                        .stock(100)
                        .category("accessories")
                        .brand("SoftFeet")
                        .color("white")
                        .gender("unisex")
                        .rating(4.4)
                        .imageUrl(null)
                        .build()
        );

        repo.saveAll(products);
    }
}