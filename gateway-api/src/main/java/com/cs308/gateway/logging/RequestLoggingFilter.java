package com.cs308.gateway.logging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class RequestLoggingFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest req = exchange.getRequest();
        log.info(">> {} {} from {}", req.getMethod(), req.getURI(), req.getRemoteAddress());
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            var res = exchange.getResponse();
            log.info("<< {} {} -> {}", req.getMethod(), req.getURI().getPath(), res.getStatusCode());
        }));
    }

    @Override
    public int getOrder() {
        return -50;
    }
}
