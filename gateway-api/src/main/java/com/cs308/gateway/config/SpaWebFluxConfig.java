package com.cs308.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;

import static org.springframework.web.reactive.function.server.RequestPredicates.GET;
import static org.springframework.web.reactive.function.server.RequestPredicates.accept;
import static org.springframework.web.reactive.function.server.RouterFunctions.route;

@Configuration
public class SpaWebFluxConfig {

    @Bean
    public RouterFunction<ServerResponse> spaRouter() {
        ClassPathResource index = new ClassPathResource("static/index.html");
        return route(GET("/**")
                .and(accept(MediaType.TEXT_HTML))
                .and(req -> !req.uri().getPath().startsWith("/api")) // Exclude API
                .and(req -> !req.uri().getPath().matches(".*\\.[a-zA-Z0-9]+$")), // Exclude static files (extensions)
                req -> ServerResponse.ok()
                        .contentType(MediaType.TEXT_HTML)
                        .body(BodyInserters.fromResource(index)));
    }
}
