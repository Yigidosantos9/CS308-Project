# CS308 Gateway API

Spring Cloud Gateway for the CS308 e‑commerce project. This is your edge service that:
- Terminates CORS and forwards to backend microservices
- Optionally enforces JWT on *secured* paths
- Adds request/response logging and correlation IDs
- Provides circuit breaker fallbacks for critical routes
- Exposes Actuator + Prometheus metrics

## Quick Start

```bash
# 1) Build and run locally
cd gateway-api
mvn spring-boot:run

# 2) Or build the jar
mvn -DskipTests package

# 3) Or run with Docker
docker build -t cs308/gateway-api:latest .
docker run -p 8080:8080   -e FRONTEND_ORIGINS=http://localhost:3000   -e PRODUCT_SERVICE_URI=http://localhost:9001   -e ORDER_SERVICE_URI=http://localhost:9002   -e CART_SERVICE_URI=http://localhost:9003   -e REVIEW_SERVICE_URI=http://localhost:9004   -e PAYMENT_SERVICE_URI=http://localhost:9005   cs308/gateway-api:latest
```

## Environment Variables

| Variable | Default | Purpose |
|---------|---------|---------|
| `GATEWAY_PORT` | 8080 | Gateway port |
| `FRONTEND_ORIGINS` | http://localhost:3000 | CORS allowed origins (comma separated) |
| `AUTH_SERVICE_URI` | http://localhost:9000 | Auth service base URL |
| `PRODUCT_SERVICE_URI` | http://localhost:9001 | Product service base URL |
| `ORDER_SERVICE_URI` | http://localhost:9002 | Order service base URL |
| `CART_SERVICE_URI` | http://localhost:9003 | Cart service base URL |
| `REVIEW_SERVICE_URI` | http://localhost:9004 | Review service base URL |
| `PAYMENT_SERVICE_URI` | http://localhost:9005 | Payment service base URL |
| `JWT_ENABLED` | false | Turn on JWT verification at the gateway |
| `JWT_SECRET` | *(empty)* | HS256 secret to verify tokens (required if `JWT_ENABLED=true`) |
| `SECURED_PATHS` | `/api/orders/**,/api/cart/**,/api/payments/**,/api/reviews/**` | Ant patterns that require a valid JWT |

## Routes

- `/api/auth/**` → `AUTH_SERVICE_URI`
- `/api/products/**` → `PRODUCT_SERVICE_URI`
- `/api/orders/**` → `ORDER_SERVICE_URI`
- `/api/cart/**` → `CART_SERVICE_URI`
- `/api/reviews/**` → `REVIEW_SERVICE_URI`
- `/api/payments/**` → `PAYMENT_SERVICE_URI`

> We call `StripPrefix=1`, so your downstream services should expose paths **without** the `/api` prefix (e.g., gateway `/api/products` → product service `/products`).

## JWT Enforcement (Optional)

- By default, JWT is **disabled** so teammates can continue developing without blocking.
- To enforce auth, set `JWT_ENABLED=true` and provide `JWT_SECRET`.
- Secured paths are controlled by `SECURED_PATHS` (comma‑separated ant patterns).

## Notes for the Team

- The gateway forwards the `Authorization` header to downstream services.
- When JWT is enabled and valid, we also add `X-User-Id` from the token's `sub` claim.
- Circuit breaker fallbacks are provided for `products` and `orders` (`/__fallback/*`). Extend as needed.

## Health & Metrics

- Actuator at `/actuator/health`, `/actuator/metrics`, `/actuator/prometheus`.

## Common Curl Tests

```bash
# CORS preflight
curl -i -X OPTIONS http://localhost:8080/api/products   -H "Origin: http://localhost:3000"   -H "Access-Control-Request-Method: GET"

# Public: products (no JWT)
curl -i http://localhost:8080/api/products

# Secured: orders (requires JWT if enabled)
curl -i http://localhost:8080/api/orders   -H "Authorization: Bearer <token>"
```
