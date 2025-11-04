package com.cs308.gateway.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@ConfigurationProperties(prefix = "gateway.cors")
public class CorsConfig {
    private List<String> allowedOrigins = List.of("http://localhost:3000");
    private List<String> allowedMethods = Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
    private String allowedHeaders = "*";
    private String exposedHeaders = "X-Request-Id";
    private boolean allowCredentials = true;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(allowedMethods);
        config.addAllowedHeader(allowedHeaders);
        config.setExposedHeaders(Arrays.asList(exposedHeaders.split(",")));
        config.setAllowCredentials(allowCredentials);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) { this.allowedOrigins = allowedOrigins; }
    public void setAllowedMethods(List<String> allowedMethods) { this.allowedMethods = allowedMethods; }
    public void setAllowedHeaders(String allowedHeaders) { this.allowedHeaders = allowedHeaders; }
    public void setExposedHeaders(String exposedHeaders) { this.exposedHeaders = exposedHeaders; }
    public void setAllowCredentials(boolean allowCredentials) { this.allowCredentials = allowCredentials; }
}
