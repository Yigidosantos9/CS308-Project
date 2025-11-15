# CS308 Product Service

Basit bir ürün servisi. Gateway ile uyumlu çalışır (StripPrefix=1, path `/products`).

## Çalıştırma
```bash
cd product-service
mvn spring-boot:run
# Port: 9001 (application.yml)
```

## GET Endpointleri
- `GET /products` → Tüm ürün listesi (opsiyonel `q` parametresi ile arama)
- `GET /products/{id}` → ID ile ürün getirir

## Örnek
```bash
curl -s http://localhost:9001/products | jq
curl -s http://localhost:9001/products/1 | jq
curl -s "http://localhost:9001/products?q=macbook" | jq
```
