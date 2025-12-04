package com.cs308.gateway.config;

import com.cs308.gateway.security.JwtWebFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.reactive.CorsConfigurationSource;

@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtWebFilter jwtWebFilter;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http.csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .authorizeExchange(ex -> ex
                        .pathMatchers("/actuator/**").permitAll()
                        .pathMatchers("/__fallback/**").permitAll()
                        .pathMatchers("/api/membership/**").permitAll()
                        .pathMatchers("/api/auth/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/products/**").hasRole("PRODUCT_MANAGER")
                        .pathMatchers(HttpMethod.PUT, "/api/products/**").hasRole("PRODUCT_MANAGER")
                        .pathMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("PRODUCT_MANAGER")
                        .pathMatchers("/api/orders/**").hasRole("CUSTOMER")
                        .pathMatchers("/api/cart/**").permitAll() // Allow guests, controller handles logic
                        .pathMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/reviews/**").hasRole("CUSTOMER")
                        .pathMatchers(HttpMethod.DELETE, "/api/reviews/**").hasRole("CUSTOMER")
                        .pathMatchers("/api/payments/**").hasRole("CUSTOMER")
                        .anyExchange().authenticated())
                .addFilterAt(jwtWebFilter, SecurityWebFiltersOrder.AUTHENTICATION);
        return http.build();
    }
}
