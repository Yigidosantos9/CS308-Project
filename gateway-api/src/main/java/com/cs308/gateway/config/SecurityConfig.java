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
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .authorizeExchange(ex -> ex
                        .pathMatchers("/actuator/**").permitAll()
                        .pathMatchers("/__fallback/**").permitAll()
                        .pathMatchers("/api/membership/**").permitAll()
                        .pathMatchers("/api/auth/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/support/chat/start").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/support/chat/*/message").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/support/chat/*/file").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/support/chat/*/close").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/support/chat/*/messages").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/support/chat/active").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/support/chat/*").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/support/chat/*/file/*").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/products/**").hasRole("PRODUCT_MANAGER")
                        .pathMatchers(HttpMethod.PUT, "/api/products/**").hasRole("PRODUCT_MANAGER")
                        .pathMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("PRODUCT_MANAGER")
                        .pathMatchers(HttpMethod.PUT, "/api/orders/*/status").hasRole("PRODUCT_MANAGER")
                        .pathMatchers("/api/orders/**").authenticated() // Allow any authenticated user
                        .pathMatchers("/api/cart/**").permitAll() // Allow guests, controller handles logic
                        .pathMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/reviews/**").authenticated() // Any authenticated user can
                                                                                          // review
                        .pathMatchers(HttpMethod.DELETE, "/api/reviews/**").authenticated()
                        .pathMatchers("/api/payments/**").authenticated()
                        // Allow static resources and SPA index.html
                        .pathMatchers("/", "/index.html", "/assets/**", "/*.js", "/*.css", "/*.ico", "/*.png", "/*.jpg")
                        .permitAll()
                        .anyExchange().authenticated())
                .addFilterAt(jwtWebFilter, SecurityWebFiltersOrder.AUTHENTICATION);
        return http.build();
    }
}
