# Mock Data Kullanım Kılavuzu

## 📋 Özet
Bu dosya, `product-api` için 20 ürün ve 60 ürün varyantı içeren mock data SQL dosyasıdır.

## 📁 Dosya Konumu
- **SQL Dosyası**: `src/main/resources/mock-data.sql`

## 🚀 Kullanım Yöntemleri

### Yöntem 1: pgAdmin ile (Önerilen)
1. pgAdmin'i açın
2. Veritabanına bağlanın: `cs308-postgres.postgres.database.azure.com`
3. `postgres` veritabanını seçin
4. Sağ tıklayın → **Query Tool**
5. `mock-data.sql` dosyasının içeriğini kopyalayıp yapıştırın
6. **Execute** (F5) tuşuna basın

### Yöntem 2: DBeaver ile
1. DBeaver'i açın
2. PostgreSQL bağlantısı oluşturun
3. `mock-data.sql` dosyasını açın
4. **Execute SQL Script** (Ctrl+Alt+X) tuşuna basın

### Yöntem 3: psql ile (Terminal)
```bash
psql -h cs308-postgres.postgres.database.azure.com -U cs308user -d postgres -f mock-data.sql
```

## 📊 Eklenen Veriler

### Products Tablosu
- **20 ürün** eklenecek
- Her ürün için: name, price, stock, model, serial_number, description, brand, product_type, target_audience, warranty_status, distributor_info, season, fit, material, care_instructions

### Product Variants Tablosu
- **60 varyant** eklenecek (her ürün için 3 varyant)
- Her varyant için: sku, barcode, color, size, stock_quantity, price, discounted_price

## ⚠️ Önemli Notlar

1. **Mevcut Veriler**: Eğer `products` tablosunda zaten veri varsa, variant eklerken `product_id` değerlerini kontrol edin. SQL dosyası tablo boşsa 1-20 arası ID'leri varsayar.

2. **Temizleme**: Önce mevcut verileri temizlemek isterseniz:
   ```sql
   TRUNCATE TABLE product_variants CASCADE;
   TRUNCATE TABLE products CASCADE;
   ```

3. **ID Kontrolü**: Variant eklemeden önce son product ID'yi kontrol edin:
   ```sql
   SELECT MAX(id) FROM products;
   ```

## ✅ Doğrulama

SQL çalıştırdıktan sonra kontrol edin:

```sql
-- Toplam ürün sayısı (20 olmalı)
SELECT COUNT(*) FROM products;

-- Toplam varyant sayısı (60 olmalı)
SELECT COUNT(*) FROM product_variants;

-- İlk 5 ürünü görüntüle
SELECT id, name, price, stock FROM products LIMIT 5;
```

## 🔧 Sorun Giderme

- **Hata: duplicate key value**: Tabloda zaten veri var, önce temizleyin
- **Hata: foreign key constraint**: Önce products tablosunu doldurun, sonra variants
- **Hata: invalid enum value**: Enum değerlerini kontrol edin (ProductType, TargetAudience, vb.)

## 📝 Not
Bu SQL dosyası mevcut kodları değiştirmez, sadece veritabanına veri ekler.

