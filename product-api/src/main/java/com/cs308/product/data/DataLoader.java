package com.cs308.product.data;

import com.cs308.product.domain.Product;
import com.cs308.product.domain.enums.Fit;
import com.cs308.product.domain.enums.ProductType;
import com.cs308.product.domain.enums.Season;
import com.cs308.product.domain.enums.TargetAudience;
import com.cs308.product.domain.enums.WarrantyStatus;
import com.cs308.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Profile("!test") // test ortamında çalışmasın
public class DataLoader implements CommandLineRunner {

        private final ProductRepository repo;

        @Override
        public void run(String... args) {
                // Eğer zaten ürün varsa seed etme
                // Eğer zaten ürün varsa seed etme
                if (repo.count() > 0) {
                        return;
                }

                List<Product> products = List.of(
                                // 1. Oversize Basic T-Shirt
                                Product.builder()
                                                .name("Oversize Basic T-Shirt")
                                                .price(249.90)
                                                .stock(50)
                                                .model("TS-OVERSIZE-001")
                                                .serialNumber("SN-TS-0001")
                                                .description("Unisex, %100 pamuk, beyaz basic t-shirt. Rahat kesim, günlük kullanım için ideal.")
                                                .brand("BasicLab")
                                                .productType(ProductType.TSHIRT)
                                                .targetAudience(TargetAudience.UNISEX)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("BasicLab Distribütör A.Ş., İstanbul, Türkiye")
                                                .season(Season.SUMMER)
                                                .fit(Fit.OVERSIZE)
                                                .material("%100 Cotton")
                                                .careInstructions(
                                                                "30°C hassas yıkama, tersten ütüleme, çamaşır kurutma makinesinde düşük ısıda kurutma")
                                                .active(true)
                                                .build(),

                                // 2. High-Waist Straight Jean
                                Product.builder()
                                                .name("High-Waist Straight Jean")
                                                .price(459.00)
                                                .stock(35)
                                                .model("JEANS-HW-STRAIGHT-001")
                                                .serialNumber("SN-JEANS-0001")
                                                .description("Kadın, yüksek bel, mavi jean. Klasik straight fit, günlük ve şık kombinler için.")
                                                .brand("Denim&Co")
                                                .productType(ProductType.JEANS)
                                                .targetAudience(TargetAudience.WOMEN)
                                                .warrantyStatus(WarrantyStatus.LIMITED)
                                                .distributorInfo("Denim&Co Resmi Distribütör, İzmir, Türkiye")
                                                .season(Season.FALL)
                                                .fit(Fit.REGULAR)
                                                .material("98% Cotton, 2% Elastane")
                                                .careInstructions("30°C yıkama, ağartıcı kullanmayın, tersten kurutma")
                                                .active(true)
                                                .build(),

                                // 3. Hoodie Sweatshirt
                                Product.builder()
                                                .name("Hoodie Sweatshirt")
                                                .price(399.00)
                                                .stock(40)
                                                .model("HOODIE-SW-001")
                                                .serialNumber("SN-HOODIE-0001")
                                                .description("Unisex, kapüşonlu sweatshirt. Siyah renk, rahat ve şık tasarım.")
                                                .brand("UrbanWear")
                                                .productType(ProductType.HOODIE)
                                                .targetAudience(TargetAudience.UNISEX)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("UrbanWear Distribütör, Ankara, Türkiye")
                                                .season(Season.WINTER)
                                                .fit(Fit.REGULAR)
                                                .material("80% Cotton, 20% Polyester")
                                                .careInstructions("30°C yıkama, düşük ısıda ütüleme")
                                                .active(true)
                                                .build(),

                                // 4. Classic White Shirt
                                Product.builder()
                                                .name("Classic White Shirt")
                                                .price(329.00)
                                                .stock(45)
                                                .model("SHIRT-CLASSIC-001")
                                                .serialNumber("SN-SHIRT-0001")
                                                .description("Erkek, klasik beyaz gömlek. İş ve günlük kullanım için uygun.")
                                                .brand("FormalWear")
                                                .productType(ProductType.SHIRT)
                                                .targetAudience(TargetAudience.MEN)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("FormalWear Distribütör, Bursa, Türkiye")
                                                .season(Season.SPRING)
                                                .fit(Fit.REGULAR)
                                                .material("%100 Cotton")
                                                .careInstructions("40°C yıkama, ütüleme gerekli")
                                                .active(true)
                                                .build(),

                                // 5. Summer Dress
                                Product.builder()
                                                .name("Summer Dress")
                                                .price(599.00)
                                                .stock(30)
                                                .model("DRESS-SUMMER-001")
                                                .serialNumber("SN-DRESS-0001")
                                                .description("Kadın, yaz elbisesi. Hafif kumaş, rahat kesim, günlük ve özel günler için.")
                                                .brand("FashionStyle")
                                                .productType(ProductType.DRESS)
                                                .targetAudience(TargetAudience.WOMEN)
                                                .warrantyStatus(WarrantyStatus.LIMITED)
                                                .distributorInfo("FashionStyle Distribütör, Antalya, Türkiye")
                                                .season(Season.SUMMER)
                                                .fit(Fit.REGULAR)
                                                .material("100% Polyester")
                                                .careInstructions("30°C hassas yıkama, düşük ısıda ütüleme")
                                                .active(true)
                                                .build(),

                                // 6. Winter Coat
                                Product.builder()
                                                .name("Winter Coat")
                                                .price(899.00)
                                                .stock(25)
                                                .model("COAT-WINTER-001")
                                                .serialNumber("SN-COAT-0001")
                                                .description("Unisex, kış montu. Su geçirmez, sıcak tutan, şık tasarım.")
                                                .brand("OutdoorGear")
                                                .productType(ProductType.COAT)
                                                .targetAudience(TargetAudience.UNISEX)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("OutdoorGear Distribütör, İstanbul, Türkiye")
                                                .season(Season.WINTER)
                                                .fit(Fit.REGULAR)
                                                .material("Polyester, Polyamide")
                                                .careInstructions("Profesyonel temizleme önerilir")
                                                .active(true)
                                                .build(),

                                // 7. Slim Fit Jeans
                                Product.builder()
                                                .name("Slim Fit Jeans")
                                                .price(429.00)
                                                .stock(40)
                                                .model("JEANS-SLIM-001")
                                                .serialNumber("SN-JEANS-0002")
                                                .description("Erkek, slim fit jean. Modern kesim, rahat kumaş.")
                                                .brand("Denim&Co")
                                                .productType(ProductType.JEANS)
                                                .targetAudience(TargetAudience.MEN)
                                                .warrantyStatus(WarrantyStatus.LIMITED)
                                                .distributorInfo("Denim&Co Resmi Distribütör, İzmir, Türkiye")
                                                .season(Season.FALL)
                                                .fit(Fit.SLIM)
                                                .material("98% Cotton, 2% Elastane")
                                                .careInstructions("30°C yıkama, tersten kurutma")
                                                .active(true)
                                                .build(),

                                // 8. Kids T-Shirt
                                Product.builder()
                                                .name("Kids T-Shirt")
                                                .price(179.00)
                                                .stock(60)
                                                .model("TS-KIDS-001")
                                                .serialNumber("SN-TS-KIDS-0001")
                                                .description("Çocuk, renkli t-shirt. Pamuklu, rahat, günlük kullanım.")
                                                .brand("KidsWear")
                                                .productType(ProductType.TSHIRT)
                                                .targetAudience(TargetAudience.KIDS)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("KidsWear Distribütör, İstanbul, Türkiye")
                                                .season(Season.SPRING)
                                                .fit(Fit.REGULAR)
                                                .material("%100 Cotton")
                                                .careInstructions("30°C yıkama, güvenli deterjan kullanın")
                                                .active(true)
                                                .build(),

                                // 9. Wool Sweater
                                Product.builder()
                                                .name("Wool Sweater")
                                                .price(549.00)
                                                .stock(20)
                                                .model("SWEATER-WOOL-001")
                                                .serialNumber("SN-SWEATER-0001")
                                                .description("Unisex, yünlü kazak. Sıcak tutan, kaliteli malzeme.")
                                                .brand("PremiumWear")
                                                .productType(ProductType.SWEATER)
                                                .targetAudience(TargetAudience.UNISEX)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("PremiumWear Distribütör, İstanbul, Türkiye")
                                                .season(Season.WINTER)
                                                .fit(Fit.REGULAR)
                                                .material("80% Wool, 20% Acrylic")
                                                .careInstructions("Soğuk suda yıkama, yatay kurutma")
                                                .active(true)
                                                .build(),

                                // 10. Leather Jacket
                                Product.builder()
                                                .name("Leather Jacket")
                                                .price(1299.00)
                                                .stock(15)
                                                .model("JACKET-LEATHER-001")
                                                .serialNumber("SN-JACKET-0001")
                                                .description("Erkek, deri ceket. Klasik ve şık tasarım, kaliteli deri.")
                                                .brand("LeatherCraft")
                                                .productType(ProductType.JACKET)
                                                .targetAudience(TargetAudience.MEN)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("LeatherCraft Distribütör, İstanbul, Türkiye")
                                                .season(Season.FALL)
                                                .fit(Fit.REGULAR)
                                                .material("100% Genuine Leather")
                                                .careInstructions("Profesyonel deri temizleme önerilir")
                                                .active(true)
                                                .build(),

                                // 11. Midi Skirt
                                Product.builder()
                                                .name("Midi Skirt")
                                                .price(349.00)
                                                .stock(35)
                                                .model("SKIRT-MIDI-001")
                                                .serialNumber("SN-SKIRT-0001")
                                                .description("Kadın, midi etek. Şık ve zarif, iş ve günlük kullanım.")
                                                .brand("ElegantStyle")
                                                .productType(ProductType.SKIRT)
                                                .targetAudience(TargetAudience.WOMEN)
                                                .warrantyStatus(WarrantyStatus.LIMITED)
                                                .distributorInfo("ElegantStyle Distribütör, Ankara, Türkiye")
                                                .season(Season.SPRING)
                                                .fit(Fit.REGULAR)
                                                .material("65% Polyester, 35% Viscose")
                                                .careInstructions("30°C hassas yıkama, düşük ısıda ütüleme")
                                                .active(true)
                                                .build(),

                                // 12. Cargo Shorts
                                Product.builder()
                                                .name("Cargo Shorts")
                                                .price(279.00)
                                                .stock(50)
                                                .model("SHORTS-CARGO-001")
                                                .serialNumber("SN-SHORTS-0001")
                                                .description("Erkek, cargo şort. Rahat, çok cepli, günlük ve spor kullanım.")
                                                .brand("ActiveWear")
                                                .productType(ProductType.SHORTS)
                                                .targetAudience(TargetAudience.MEN)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("ActiveWear Distribütör, İzmir, Türkiye")
                                                .season(Season.SUMMER)
                                                .fit(Fit.REGULAR)
                                                .material("100% Cotton")
                                                .careInstructions("40°C yıkama, normal ütüleme")
                                                .active(true)
                                                .build(),

                                // 13. Cotton Underwear Pack
                                Product.builder()
                                                .name("Cotton Underwear Pack")
                                                .price(149.00)
                                                .stock(100)
                                                .model("UNDERWEAR-PACK-001")
                                                .serialNumber("SN-UNDERWEAR-0001")
                                                .description("Unisex, pamuklu iç çamaşırı paketi (3 adet). Rahat ve sağlıklı.")
                                                .brand("ComfortWear")
                                                .productType(ProductType.UNDERWEAR)
                                                .targetAudience(TargetAudience.UNISEX)
                                                .warrantyStatus(WarrantyStatus.NONE)
                                                .distributorInfo("ComfortWear Distribütör, Bursa, Türkiye")
                                                .fit(Fit.REGULAR)
                                                .material("%100 Cotton")
                                                .careInstructions("60°C yıkama, güneşte kurutma")
                                                .active(true)
                                                .build(),

                                // 14. Baseball Cap
                                Product.builder()
                                                .name("Baseball Cap")
                                                .price(199.00)
                                                .stock(80)
                                                .model("ACCESSORY-CAP-001")
                                                .serialNumber("SN-CAP-0001")
                                                .description("Unisex, baseball şapkası. Güneş korumalı, şık tasarım.")
                                                .brand("StreetStyle")
                                                .productType(ProductType.ACCESSORY)
                                                .targetAudience(TargetAudience.UNISEX)
                                                .warrantyStatus(WarrantyStatus.NONE)
                                                .distributorInfo("StreetStyle Distribütör, İstanbul, Türkiye")
                                                .season(Season.SUMMER)
                                                .material("100% Cotton")
                                                .careInstructions("Elde yıkama, gölgede kurutma")
                                                .active(true)
                                                .build(),

                                // 15. Polo Shirt
                                Product.builder()
                                                .name("Polo Shirt")
                                                .price(299.00)
                                                .stock(45)
                                                .model("SHIRT-POLO-001")
                                                .serialNumber("SN-SHIRT-POLO-0001")
                                                .description("Erkek, polo gömlek. Klasik ve şık, iş ve günlük kullanım.")
                                                .brand("ClassicWear")
                                                .productType(ProductType.SHIRT)
                                                .targetAudience(TargetAudience.MEN)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("ClassicWear Distribütör, İstanbul, Türkiye")
                                                .season(Season.SPRING)
                                                .fit(Fit.REGULAR)
                                                .material("60% Cotton, 40% Polyester")
                                                .careInstructions("40°C yıkama, düşük ısıda ütüleme")
                                                .active(true)
                                                .build(),

                                // 16. Floral Print Dress
                                Product.builder()
                                                .name("Floral Print Dress")
                                                .price(479.00)
                                                .stock(28)
                                                .model("DRESS-FLORAL-001")
                                                .serialNumber("SN-DRESS-0002")
                                                .description("Kadın, çiçek desenli elbise. Yaz için ideal, şık ve rahat.")
                                                .brand("FashionStyle")
                                                .productType(ProductType.DRESS)
                                                .targetAudience(TargetAudience.WOMEN)
                                                .warrantyStatus(WarrantyStatus.LIMITED)
                                                .distributorInfo("FashionStyle Distribütör, Antalya, Türkiye")
                                                .season(Season.SUMMER)
                                                .fit(Fit.REGULAR)
                                                .material("100% Viscose")
                                                .careInstructions("30°C hassas yıkama, buharlı ütüleme")
                                                .active(true)
                                                .build(),

                                // 17. Track Pants
                                Product.builder()
                                                .name("Track Pants")
                                                .price(329.00)
                                                .stock(55)
                                                .model("PANTS-TRACK-001")
                                                .serialNumber("SN-PANTS-0001")
                                                .description("Unisex, eşofman altı. Spor ve günlük kullanım için rahat.")
                                                .brand("SportWear")
                                                .productType(ProductType.PANTS)
                                                .targetAudience(TargetAudience.UNISEX)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("SportWear Distribütör, İstanbul, Türkiye")
                                                .season(Season.SPRING)
                                                .fit(Fit.REGULAR)
                                                .material("80% Cotton, 20% Polyester")
                                                .careInstructions("40°C yıkama, düşük ısıda kurutma")
                                                .active(true)
                                                .build(),

                                // 18. Denim Jacket
                                Product.builder()
                                                .name("Denim Jacket")
                                                .price(499.00)
                                                .stock(30)
                                                .model("JACKET-DENIM-001")
                                                .serialNumber("SN-JACKET-0002")
                                                .description("Unisex, denim ceket. Klasik ve şık, her mevsim kullanılabilir.")
                                                .brand("Denim&Co")
                                                .productType(ProductType.JACKET)
                                                .targetAudience(TargetAudience.UNISEX)
                                                .warrantyStatus(WarrantyStatus.LIMITED)
                                                .distributorInfo("Denim&Co Resmi Distribütör, İzmir, Türkiye")
                                                .season(Season.FALL)
                                                .fit(Fit.REGULAR)
                                                .material("100% Cotton Denim")
                                                .careInstructions("30°C yıkama, tersten kurutma")
                                                .active(true)
                                                .build(),

                                // 19. Kids Jeans
                                Product.builder()
                                                .name("Kids Jeans")
                                                .price(249.00)
                                                .stock(50)
                                                .model("JEANS-KIDS-001")
                                                .serialNumber("SN-JEANS-KIDS-0001")
                                                .description("Çocuk, klasik jean. Dayanıklı ve rahat, günlük kullanım.")
                                                .brand("KidsWear")
                                                .productType(ProductType.JEANS)
                                                .targetAudience(TargetAudience.KIDS)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("KidsWear Distribütör, İstanbul, Türkiye")
                                                .season(Season.FALL)
                                                .fit(Fit.REGULAR)
                                                .material("98% Cotton, 2% Elastane")
                                                .careInstructions("30°C yıkama, güvenli deterjan")
                                                .active(true)
                                                .build(),

                                // 20. Silk Scarf
                                Product.builder()
                                                .name("Silk Scarf")
                                                .price(179.00)
                                                .stock(40)
                                                .model("ACCESSORY-SCARF-001")
                                                .serialNumber("SN-SCARF-0001")
                                                .description("Kadın, ipek eşarp. Şık aksesuar, özel günler için.")
                                                .brand("LuxuryAccessories")
                                                .productType(ProductType.ACCESSORY)
                                                .targetAudience(TargetAudience.WOMEN)
                                                .warrantyStatus(WarrantyStatus.NONE)
                                                .distributorInfo("LuxuryAccessories Distribütör, İstanbul, Türkiye")
                                                .season(Season.SPRING)
                                                .material("100% Silk")
                                                .careInstructions("Profesyonel temizleme önerilir")
                                                .active(true)
                                                .build(),

                                // 21. Running Shoes
                                Product.builder()
                                                .name("Running Shoes")
                                                .price(899.00)
                                                .stock(25)
                                                .model("SHOES-RUN-001")
                                                .serialNumber("SN-SHOES-0001")
                                                .description("Unisex, koşu ayakkabısı. Hafif, esnek taban, nefes alan kumaş.")
                                                .brand("SportStep")
                                                .productType(ProductType.SHOES)
                                                .targetAudience(TargetAudience.UNISEX)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("SportStep Distribütör, İstanbul, Türkiye")
                                                .season(Season.SUMMER)
                                                .fit(Fit.REGULAR)
                                                .material("Synthetic, Mesh")
                                                .careInstructions("Elde yıkama, gölgede kurutma")
                                                .active(true)
                                                .build(),

                                // 22. Smart Watch
                                Product.builder()
                                                .name("Smart Watch")
                                                .price(2499.00)
                                                .stock(15)
                                                .model("WATCH-SMART-001")
                                                .serialNumber("SN-WATCH-0001")
                                                .description("Unisex, akıllı saat. Adımsayar, nabız ölçer, su geçirmez.")
                                                .brand("TechTime")
                                                .productType(ProductType.ACCESSORY)
                                                .targetAudience(TargetAudience.UNISEX)
                                                .warrantyStatus(WarrantyStatus.EXTENDED)
                                                .distributorInfo("TechTime Distribütör, Ankara, Türkiye")
                                                .active(true)
                                                .build(),

                                // 23. Backpack
                                Product.builder()
                                                .name("Backpack")
                                                .price(399.00)
                                                .stock(40)
                                                .model("BAG-BACK-001")
                                                .serialNumber("SN-BAG-0001")
                                                .description("Unisex, sırt çantası. Laptop bölmeli, su geçirmez, dayanıklı.")
                                                .brand("TravelGear")
                                                .productType(ProductType.ACCESSORY)
                                                .targetAudience(TargetAudience.UNISEX)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("TravelGear Distribütör, İzmir, Türkiye")
                                                .season(Season.FALL)
                                                .material("Polyester")
                                                .careInstructions("Nemli bezle silin")
                                                .active(true)
                                                .build(),

                                // 24. Formal Trousers
                                Product.builder()
                                                .name("Formal Trousers")
                                                .price(499.00)
                                                .stock(30)
                                                .model("PANTS-FORMAL-001")
                                                .serialNumber("SN-PANTS-FORMAL-0001")
                                                .description("Erkek, kumaş pantolon. Klasik kesim, iş ve özel günler için.")
                                                .brand("FormalWear")
                                                .productType(ProductType.PANTS)
                                                .targetAudience(TargetAudience.MEN)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("FormalWear Distribütör, Bursa, Türkiye")
                                                .season(Season.SPRING)
                                                .fit(Fit.REGULAR)
                                                .material("65% Polyester, 35% Viscose")
                                                .careInstructions("Kuru temizleme önerilir")
                                                .active(true)
                                                .build(),

                                // 25. Raincoat
                                Product.builder()
                                                .name("Raincoat")
                                                .price(699.00)
                                                .stock(20)
                                                .model("COAT-RAIN-001")
                                                .serialNumber("SN-COAT-RAIN-0001")
                                                .description("Unisex, yağmurluk. Su geçirmez, kapüşonlu, hafif.")
                                                .brand("OutdoorGear")
                                                .productType(ProductType.COAT)
                                                .targetAudience(TargetAudience.UNISEX)
                                                .warrantyStatus(WarrantyStatus.STANDARD)
                                                .distributorInfo("OutdoorGear Distribütör, İstanbul, Türkiye")
                                                .season(Season.FALL)
                                                .fit(Fit.LOOSE)
                                                .material("100% Polyester")
                                                .careInstructions("30°C yıkama, asarak kurutma")
                                                .active(true)
                                                .build());

                repo.saveAll(products);
        }
}
