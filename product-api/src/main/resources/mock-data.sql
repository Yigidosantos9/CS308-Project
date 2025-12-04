-- Mock Data for Product API
-- Bu dosyayı PostgreSQL veritabanına direkt çalıştırabilirsiniz
-- veya pgAdmin/DBeaver gibi araçlarla import edebilirsiniz
--
-- KULLANIM:
-- 1. Bu SQL dosyasını pgAdmin, DBeaver veya psql ile çalıştırın
-- 2. Önce products tablosuna 20 ürün eklenecek
-- 3. Sonra her ürün için product_variants tablosuna varyantlar eklenecek
--
-- ÖNEMLİ: Eğer products tablosunda zaten veri varsa, variant eklerken
-- product_id değerlerini kontrol edin. Bu SQL, tablo boşsa 1-20 arası ID'leri varsayar.
--
-- Önce mevcut verileri temizlemek isterseniz (opsiyonel):
-- TRUNCATE TABLE product_variants CASCADE;
-- TRUNCATE TABLE products CASCADE;

-- 20 Ürün Ekleme
INSERT INTO products (
    name, price, stock, model, serial_number, description,
    brand, product_type, target_audience, warranty_status,
    distributor_info, season, fit, material, care_instructions, active, created_at, updated_at
) VALUES
-- 1. Ürün
(
    'Oversize Basic T-Shirt',
    249.90,
    50,
    'TS-OVERSIZE-001',
    'SN-TS-0001',
    'Unisex, %100 pamuk, beyaz basic t-shirt. Rahat kesim, günlük kullanım için ideal.',
    'BasicLab',
    'TSHIRT',
    'UNISEX',
    'STANDARD',
    'BasicLab Distribütör A.Ş., İstanbul, Türkiye',
    'SUMMER',
    'OVERSIZE',
    '%100 Cotton',
    '30°C hassas yıkama, tersten ütüleme, çamaşır kurutma makinesinde düşük ısıda kurutma',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 2. Ürün
(
    'High-Waist Straight Jean',
    459.00,
    35,
    'JEANS-HW-STRAIGHT-001',
    'SN-JEANS-0001',
    'Kadın, yüksek bel, mavi jean. Klasik straight fit, günlük ve şık kombinler için.',
    'Denim&Co',
    'JEANS',
    'WOMEN',
    'LIMITED',
    'Denim&Co Resmi Distribütör, İzmir, Türkiye',
    'FALL',
    'REGULAR',
    '98% Cotton, 2% Elastane',
    '30°C yıkama, ağartıcı kullanmayın, tersten kurutma',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 3. Ürün
(
    'Hoodie Sweatshirt',
    399.00,
    40,
    'HOODIE-SW-001',
    'SN-HOODIE-0001',
    'Unisex, kapüşonlu sweatshirt. Siyah renk, rahat ve şık tasarım.',
    'UrbanWear',
    'HOODIE',
    'UNISEX',
    'STANDARD',
    'UrbanWear Distribütör, Ankara, Türkiye',
    'WINTER',
    'REGULAR',
    '80% Cotton, 20% Polyester',
    '30°C yıkama, düşük ısıda ütüleme',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 4. Ürün
(
    'Classic White Shirt',
    329.00,
    45,
    'SHIRT-CLASSIC-001',
    'SN-SHIRT-0001',
    'Erkek, klasik beyaz gömlek. İş ve günlük kullanım için uygun.',
    'FormalWear',
    'SHIRT',
    'MEN',
    'STANDARD',
    'FormalWear Distribütör, Bursa, Türkiye',
    'SPRING',
    'REGULAR',
    '%100 Cotton',
    '40°C yıkama, ütüleme gerekli',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 5. Ürün
(
    'Summer Dress',
    599.00,
    30,
    'DRESS-SUMMER-001',
    'SN-DRESS-0001',
    'Kadın, yaz elbisesi. Hafif kumaş, rahat kesim, günlük ve özel günler için.',
    'FashionStyle',
    'DRESS',
    'WOMEN',
    'LIMITED',
    'FashionStyle Distribütör, Antalya, Türkiye',
    'SUMMER',
    'REGULAR',
    '100% Polyester',
    '30°C hassas yıkama, düşük ısıda ütüleme',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 6. Ürün
(
    'Winter Coat',
    899.00,
    25,
    'COAT-WINTER-001',
    'SN-COAT-0001',
    'Unisex, kış montu. Su geçirmez, sıcak tutan, şık tasarım.',
    'OutdoorGear',
    'COAT',
    'UNISEX',
    'STANDARD',
    'OutdoorGear Distribütör, İstanbul, Türkiye',
    'WINTER',
    'REGULAR',
    'Polyester, Polyamide',
    'Profesyonel temizleme önerilir',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 7. Ürün
(
    'Slim Fit Jeans',
    429.00,
    40,
    'JEANS-SLIM-001',
    'SN-JEANS-0002',
    'Erkek, slim fit jean. Modern kesim, rahat kumaş.',
    'Denim&Co',
    'JEANS',
    'MEN',
    'LIMITED',
    'Denim&Co Resmi Distribütör, İzmir, Türkiye',
    'FALL',
    'SLIM',
    '98% Cotton, 2% Elastane',
    '30°C yıkama, tersten kurutma',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 8. Ürün
(
    'Kids T-Shirt',
    179.00,
    60,
    'TS-KIDS-001',
    'SN-TS-KIDS-0001',
    'Çocuk, renkli t-shirt. Pamuklu, rahat, günlük kullanım.',
    'KidsWear',
    'TSHIRT',
    'KIDS',
    'STANDARD',
    'KidsWear Distribütör, İstanbul, Türkiye',
    'SPRING',
    'REGULAR',
    '%100 Cotton',
    '30°C yıkama, güvenli deterjan kullanın',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 9. Ürün
(
    'Wool Sweater',
    549.00,
    20,
    'SWEATER-WOOL-001',
    'SN-SWEATER-0001',
    'Unisex, yünlü kazak. Sıcak tutan, kaliteli malzeme.',
    'PremiumWear',
    'SWEATER',
    'UNISEX',
    'STANDARD',
    'PremiumWear Distribütör, İstanbul, Türkiye',
    'WINTER',
    'REGULAR',
    '80% Wool, 20% Acrylic',
    'Soğuk suda yıkama, yatay kurutma',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 10. Ürün
(
    'Leather Jacket',
    1299.00,
    15,
    'JACKET-LEATHER-001',
    'SN-JACKET-0001',
    'Erkek, deri ceket. Klasik ve şık tasarım, kaliteli deri.',
    'LeatherCraft',
    'JACKET',
    'MEN',
    'STANDARD',
    'LeatherCraft Distribütör, İstanbul, Türkiye',
    'FALL',
    'REGULAR',
    '100% Genuine Leather',
    'Profesyonel deri temizleme önerilir',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 11. Ürün
(
    'Midi Skirt',
    349.00,
    35,
    'SKIRT-MIDI-001',
    'SN-SKIRT-0001',
    'Kadın, midi etek. Şık ve zarif, iş ve günlük kullanım.',
    'ElegantStyle',
    'SKIRT',
    'WOMEN',
    'LIMITED',
    'ElegantStyle Distribütör, Ankara, Türkiye',
    'SPRING',
    'REGULAR',
    '65% Polyester, 35% Viscose',
    '30°C hassas yıkama, düşük ısıda ütüleme',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 12. Ürün
(
    'Cargo Shorts',
    279.00,
    50,
    'SHORTS-CARGO-001',
    'SN-SHORTS-0001',
    'Erkek, cargo şort. Rahat, çok cepli, günlük ve spor kullanım.',
    'ActiveWear',
    'SHORTS',
    'MEN',
    'STANDARD',
    'ActiveWear Distribütör, İzmir, Türkiye',
    'SUMMER',
    'REGULAR',
    '100% Cotton',
    '40°C yıkama, normal ütüleme',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 13. Ürün
(
    'Cotton Underwear Pack',
    149.00,
    100,
    'UNDERWEAR-PACK-001',
    'SN-UNDERWEAR-0001',
    'Unisex, pamuklu iç çamaşırı paketi (3 adet). Rahat ve sağlıklı.',
    'ComfortWear',
    'UNDERWEAR',
    'UNISEX',
    'NONE',
    'ComfortWear Distribütör, Bursa, Türkiye',
    NULL,
    'REGULAR',
    '%100 Cotton',
    '60°C yıkama, güneşte kurutma',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 14. Ürün
(
    'Baseball Cap',
    199.00,
    80,
    'ACCESSORY-CAP-001',
    'SN-CAP-0001',
    'Unisex, baseball şapkası. Güneş korumalı, şık tasarım.',
    'StreetStyle',
    'ACCESSORY',
    'UNISEX',
    'NONE',
    'StreetStyle Distribütör, İstanbul, Türkiye',
    'SUMMER',
    NULL,
    '100% Cotton',
    'Elde yıkama, gölgede kurutma',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 15. Ürün
(
    'Polo Shirt',
    299.00,
    45,
    'SHIRT-POLO-001',
    'SN-SHIRT-POLO-0001',
    'Erkek, polo gömlek. Klasik ve şık, iş ve günlük kullanım.',
    'ClassicWear',
    'SHIRT',
    'MEN',
    'STANDARD',
    'ClassicWear Distribütör, İstanbul, Türkiye',
    'SPRING',
    'REGULAR',
    '60% Cotton, 40% Polyester',
    '40°C yıkama, düşük ısıda ütüleme',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 16. Ürün
(
    'Floral Print Dress',
    479.00,
    28,
    'DRESS-FLORAL-001',
    'SN-DRESS-0002',
    'Kadın, çiçek desenli elbise. Yaz için ideal, şık ve rahat.',
    'FashionStyle',
    'DRESS',
    'WOMEN',
    'LIMITED',
    'FashionStyle Distribütör, Antalya, Türkiye',
    'SUMMER',
    'REGULAR',
    '100% Viscose',
    '30°C hassas yıkama, buharlı ütüleme',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 17. Ürün
(
    'Track Pants',
    329.00,
    55,
    'PANTS-TRACK-001',
    'SN-PANTS-0001',
    'Unisex, eşofman altı. Spor ve günlük kullanım için rahat.',
    'SportWear',
    'PANTS',
    'UNISEX',
    'STANDARD',
    'SportWear Distribütör, İstanbul, Türkiye',
    'SPRING',
    'REGULAR',
    '80% Cotton, 20% Polyester',
    '40°C yıkama, düşük ısıda kurutma',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 18. Ürün
(
    'Denim Jacket',
    499.00,
    30,
    'JACKET-DENIM-001',
    'SN-JACKET-0002',
    'Unisex, denim ceket. Klasik ve şık, her mevsim kullanılabilir.',
    'Denim&Co',
    'JACKET',
    'UNISEX',
    'LIMITED',
    'Denim&Co Resmi Distribütör, İzmir, Türkiye',
    'FALL',
    'REGULAR',
    '100% Cotton Denim',
    '30°C yıkama, tersten kurutma',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 19. Ürün
(
    'Kids Jeans',
    249.00,
    50,
    'JEANS-KIDS-001',
    'SN-JEANS-KIDS-0001',
    'Çocuk, klasik jean. Dayanıklı ve rahat, günlük kullanım.',
    'KidsWear',
    'JEANS',
    'KIDS',
    'STANDARD',
    'KidsWear Distribütör, İstanbul, Türkiye',
    'FALL',
    'REGULAR',
    '98% Cotton, 2% Elastane',
    '30°C yıkama, güvenli deterjan',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 20. Ürün
(
    'Silk Scarf',
    179.00,
    40,
    'ACCESSORY-SCARF-001',
    'SN-SCARF-0001',
    'Kadın, ipek eşarp. Şık aksesuar, özel günler için.',
    'LuxuryAccessories',
    'ACCESSORY',
    'WOMEN',
    'NONE',
    'LuxuryAccessories Distribütör, İstanbul, Türkiye',
    'SPRING',
    NULL,
    '100% Silk',
    'Profesyonel temizleme önerilir',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Ürün Varyantları Ekleme (Her ürün için farklı renk ve beden kombinasyonları)
-- 
-- ÖNEMLİ: product_id değerleri yukarıdaki INSERT'lerden sonra oluşan ID'lere göre ayarlanmalı.
-- Bu SQL, products tablosu BOŞSA 1-20 arası ID'leri varsayar.
-- 
-- Eğer products tablosunda zaten veri varsa:
-- 1. Önce products tablosundaki son ID'yi kontrol edin: SELECT MAX(id) FROM products;
-- 2. Variant eklerken product_id değerlerini buna göre ayarlayın
-- VEYA
-- 3. Önce products tablosunu temizleyin: TRUNCATE TABLE products CASCADE;
--
-- Toplam: 20 ürün, her biri için 3 varyant = 60 varyant eklenecek

INSERT INTO product_variants (
    product_id, sku, barcode, color, size,
    stock_quantity, price, discounted_price, is_sellable
) VALUES
-- Ürün 1 (Oversize Basic T-Shirt) - Varyantlar
(1, 'TS-OVERSIZE-001-WHITE-M', '8690000000001', 'WHITE', 'M', 20, 249.90, 199.90, true),
(1, 'TS-OVERSIZE-001-WHITE-L', '8690000000002', 'WHITE', 'L', 15, 249.90, 199.90, true),
(1, 'TS-OVERSIZE-001-BLACK-M', '8690000000003', 'BLACK', 'M', 15, 249.90, NULL, true),
-- Ürün 2 (High-Waist Straight Jean) - Varyantlar
(2, 'JEANS-HW-001-BLUE-28', '8690000000004', 'BLUE', 'M', 10, 459.00, NULL, true),
(2, 'JEANS-HW-001-BLUE-30', '8690000000005', 'BLUE', 'L', 12, 459.00, NULL, true),
(2, 'JEANS-HW-001-BLUE-32', '8690000000006', 'BLUE', 'XL', 13, 459.00, NULL, true),
-- Ürün 3 (Hoodie Sweatshirt) - Varyantlar
(3, 'HOODIE-SW-001-BLACK-M', '8690000000007', 'BLACK', 'M', 15, 399.00, 349.00, true),
(3, 'HOODIE-SW-001-BLACK-L', '8690000000008', 'BLACK', 'L', 15, 399.00, 349.00, true),
(3, 'HOODIE-SW-001-GREY-M', '8690000000009', 'GREY', 'M', 10, 399.00, NULL, true),
-- Ürün 4 (Classic White Shirt) - Varyantlar
(4, 'SHIRT-CLASSIC-001-WHITE-40', '8690000000010', 'WHITE', 'M', 15, 329.00, NULL, true),
(4, 'SHIRT-CLASSIC-001-WHITE-42', '8690000000011', 'WHITE', 'L', 15, 329.00, NULL, true),
(4, 'SHIRT-CLASSIC-001-WHITE-44', '8690000000012', 'WHITE', 'XL', 15, 329.00, NULL, true),
-- Ürün 5 (Summer Dress) - Varyantlar
(5, 'DRESS-SUMMER-001-PINK-S', '8690000000013', 'PINK', 'S', 10, 599.00, 499.00, true),
(5, 'DRESS-SUMMER-001-PINK-M', '8690000000014', 'PINK', 'M', 10, 599.00, 499.00, true),
(5, 'DRESS-SUMMER-001-BLUE-M', '8690000000015', 'BLUE', 'M', 10, 599.00, NULL, true),
-- Ürün 6 (Winter Coat) - Varyantlar
(6, 'COAT-WINTER-001-BLACK-M', '8690000000016', 'BLACK', 'M', 8, 899.00, NULL, true),
(6, 'COAT-WINTER-001-BLACK-L', '8690000000017', 'BLACK', 'L', 9, 899.00, NULL, true),
(6, 'COAT-WINTER-001-NAVY-L', '8690000000018', 'NAVY', 'L', 8, 899.00, NULL, true),
-- Ürün 7 (Slim Fit Jeans) - Varyantlar
(7, 'JEANS-SLIM-001-BLUE-32', '8690000000019', 'BLUE', 'L', 15, 429.00, NULL, true),
(7, 'JEANS-SLIM-001-BLUE-34', '8690000000020', 'BLUE', 'XL', 15, 429.00, NULL, true),
(7, 'JEANS-SLIM-001-BLACK-32', '8690000000021', 'BLACK', 'L', 10, 429.00, NULL, true),
-- Ürün 8 (Kids T-Shirt) - Varyantlar
(8, 'TS-KIDS-001-RED-XS', '8690000000022', 'RED', 'XS', 20, 179.00, NULL, true),
(8, 'TS-KIDS-001-RED-S', '8690000000023', 'RED', 'S', 20, 179.00, NULL, true),
(8, 'TS-KIDS-001-BLUE-S', '8690000000024', 'BLUE', 'S', 20, 179.00, NULL, true),
-- Ürün 9 (Wool Sweater) - Varyantlar
(9, 'SWEATER-WOOL-001-BEIGE-M', '8690000000025', 'BEIGE', 'M', 7, 549.00, NULL, true),
(9, 'SWEATER-WOOL-001-BEIGE-L', '8690000000026', 'BEIGE', 'L', 7, 549.00, NULL, true),
(9, 'SWEATER-WOOL-001-BROWN-M', '8690000000027', 'BROWN', 'M', 6, 549.00, NULL, true),
-- Ürün 10 (Leather Jacket) - Varyantlar
(10, 'JACKET-LEATHER-001-BLACK-48', '8690000000028', 'BLACK', 'L', 5, 1299.00, NULL, true),
(10, 'JACKET-LEATHER-001-BLACK-50', '8690000000029', 'BLACK', 'XL', 5, 1299.00, NULL, true),
(10, 'JACKET-LEATHER-001-BROWN-48', '8690000000030', 'BROWN', 'L', 5, 1299.00, NULL, true),
-- Ürün 11 (Midi Skirt) - Varyantlar
(11, 'SKIRT-MIDI-001-BLACK-38', '8690000000031', 'BLACK', 'M', 12, 349.00, NULL, true),
(11, 'SKIRT-MIDI-001-BLACK-40', '8690000000032', 'BLACK', 'L', 12, 349.00, NULL, true),
(11, 'SKIRT-MIDI-001-NAVY-38', '8690000000033', 'NAVY', 'M', 11, 349.00, NULL, true),
-- Ürün 12 (Cargo Shorts) - Varyantlar
(12, 'SHORTS-CARGO-001-KHAKI-40', '8690000000034', 'BROWN', 'L', 17, 279.00, NULL, true),
(12, 'SHORTS-CARGO-001-KHAKI-42', '8690000000035', 'BROWN', 'XL', 17, 279.00, NULL, true),
(12, 'SHORTS-CARGO-001-BLACK-40', '8690000000036', 'BLACK', 'L', 16, 279.00, NULL, true),
-- Ürün 13 (Cotton Underwear Pack) - Varyantlar
(13, 'UNDERWEAR-PACK-001-WHITE-M', '8690000000037', 'WHITE', 'M', 35, 149.00, NULL, true),
(13, 'UNDERWEAR-PACK-001-WHITE-L', '8690000000038', 'WHITE', 'L', 35, 149.00, NULL, true),
(13, 'UNDERWEAR-PACK-001-BLACK-M', '8690000000039', 'BLACK', 'M', 30, 149.00, NULL, true),
-- Ürün 14 (Baseball Cap) - Varyantlar
(14, 'ACCESSORY-CAP-001-BLACK-ONE', '8690000000040', 'BLACK', 'M', 30, 199.00, NULL, true),
(14, 'ACCESSORY-CAP-001-WHITE-ONE', '8690000000041', 'WHITE', 'M', 25, 199.00, NULL, true),
(14, 'ACCESSORY-CAP-001-NAVY-ONE', '8690000000042', 'NAVY', 'M', 25, 199.00, NULL, true),
-- Ürün 15 (Polo Shirt) - Varyantlar
(15, 'SHIRT-POLO-001-WHITE-40', '8690000000043', 'WHITE', 'M', 15, 299.00, NULL, true),
(15, 'SHIRT-POLO-001-WHITE-42', '8690000000044', 'WHITE', 'L', 15, 299.00, NULL, true),
(15, 'SHIRT-POLO-001-NAVY-40', '8690000000045', 'NAVY', 'M', 15, 299.00, NULL, true),
-- Ürün 16 (Floral Print Dress) - Varyantlar
(16, 'DRESS-FLORAL-001-MULTI-S', '8690000000046', 'PINK', 'S', 10, 479.00, 399.00, true),
(16, 'DRESS-FLORAL-001-MULTI-M', '8690000000047', 'PINK', 'M', 10, 479.00, 399.00, true),
(16, 'DRESS-FLORAL-001-MULTI-L', '8690000000048', 'PINK', 'L', 8, 479.00, 399.00, true),
-- Ürün 17 (Track Pants) - Varyantlar
(17, 'PANTS-TRACK-001-BLACK-M', '8690000000049', 'BLACK', 'M', 20, 329.00, NULL, true),
(17, 'PANTS-TRACK-001-BLACK-L', '8690000000050', 'BLACK', 'L', 20, 329.00, NULL, true),
(17, 'PANTS-TRACK-001-GREY-M', '8690000000051', 'GREY', 'M', 15, 329.00, NULL, true),
-- Ürün 18 (Denim Jacket) - Varyantlar
(18, 'JACKET-DENIM-001-BLUE-M', '8690000000052', 'BLUE', 'M', 10, 499.00, NULL, true),
(18, 'JACKET-DENIM-001-BLUE-L', '8690000000053', 'BLUE', 'L', 10, 499.00, NULL, true),
(18, 'JACKET-DENIM-001-BLACK-M', '8690000000054', 'BLACK', 'M', 10, 499.00, NULL, true),
-- Ürün 19 (Kids Jeans) - Varyantlar
(19, 'JEANS-KIDS-001-BLUE-28', '8690000000055', 'BLUE', 'S', 17, 249.00, NULL, true),
(19, 'JEANS-KIDS-001-BLUE-30', '8690000000056', 'BLUE', 'M', 17, 249.00, NULL, true),
(19, 'JEANS-KIDS-001-BLUE-32', '8690000000057', 'BLUE', 'L', 16, 249.00, NULL, true),
-- Ürün 20 (Silk Scarf) - Varyantlar
(20, 'ACCESSORY-SCARF-001-MULTI-ONE', '8690000000058', 'PURPLE', 'M', 15, 179.00, NULL, true),
(20, 'ACCESSORY-SCARF-001-BLUE-ONE', '8690000000059', 'BLUE', 'M', 15, 179.00, NULL, true),
(20, 'ACCESSORY-SCARF-001-PINK-ONE', '8690000000060', 'PINK', 'M', 10, 179.00, NULL, true);

