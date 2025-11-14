package com.cs308.gateway.web;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
public class FallbackController {
    @GetMapping(path = "/__fallback/products", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Map<String, Object>> productsFallback() {
        return Mono.just(Map.of(
                "service", "product-service",
                "status", "degraded",
                "message", "Product service is unavailable. Please try again later."
        ));
    }

    @GetMapping(path = "/__fallback/orders", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Map<String, Object>> ordersFallback() {
        return Mono.just(Map.of(
                "service", "order-service",
                "status", "degraded",
                "message", "Order service is unavailable. Please try again later."
        ));
    }
}
