package com.cs308.gateway.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter implements GlobalFilter, Ordered {

    @Value("${gateway.security.jwt.enabled:false}")
    private boolean jwtEnabled;

    @Value("${gateway.security.jwt.secret:}")
    private String jwtSecret;

    @Value("${gateway.security.jwt.secured-paths:/api/orders/**,/api/cart/**,/api/payments/**,/api/reviews/**}")
    private String securedPathsCsv;

    private final AntPathMatcher matcher = new AntPathMatcher();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // attach correlation id
        String correlationId = Optional.ofNullable(request.getHeaders().getFirst("X-Correlation-Id"))
                .orElse(UUID.randomUUID().toString());
        exchange.getResponse().getHeaders().add("X-Correlation-Id", correlationId);

        if (!jwtEnabled) {
            // Transparently forward Authorization header if present
            return chain.filter(exchange);
        }

        String path = request.getURI().getPath();
        List<String> secured = Arrays.stream(securedPathsCsv.split(","))
                .map(String::trim).toList();
        boolean requiresAuth = secured.stream().anyMatch(p -> matcher.match(p, path));

        if (!requiresAuth) {
            return chain.filter(exchange);
        }

        List<String> auth = request.getHeaders().getOrEmpty(HttpHeaders.AUTHORIZATION);
        if (auth.isEmpty()) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = auth.get(0);
        return Mono.fromSupplier(() -> JwtUtil.parse(token, jwtSecret))
                .flatMap(claimsOpt -> {
                    if (claimsOpt.isEmpty()) {
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return exchange.getResponse().setComplete();
                    }
                    // Optionally, add user id to headers for downstream
                    String subject = claimsOpt.get().getSubject();
                    ServerHttpRequest mutated = request.mutate()
                            .header("X-User-Id", subject == null ? "" : subject)
                            .build();
                    return chain.filter(exchange.mutate().request(mutated).build());
                });
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
