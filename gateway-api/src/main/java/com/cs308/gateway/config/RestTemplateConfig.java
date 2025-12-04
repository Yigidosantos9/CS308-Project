package com.cs308.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Value("${AUTH_SERVICE_URI:http://localhost:8000}")
    private String authServiceUri;

    @Value("${PRODUCT_SERVICE_URI:http://localhost:9001}")
    private String productServiceUri;

    @Value("${ORDER_SERVICE_URI:http://localhost:9002}")
    private String orderServiceUri;

    @Bean
    public RestTemplateBuilder restTemplateBuilder() {
        return new RestTemplateBuilder();
    }

    @Bean(name = "authRestTemplate")
    public RestTemplate authRestTemplate(RestTemplateBuilder builder) {
        ClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        return builder
                .rootUri(authServiceUri)
                .requestFactory(() -> factory)
                .build();
    }

    @Bean(name = "productRestTemplate")
    public RestTemplate productRestTemplate(RestTemplateBuilder builder) {
        ClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        return builder
                .rootUri(productServiceUri)
                .requestFactory(() -> factory)
                .build();
    }

    @Bean(name = "orderRestTemplate")
    public RestTemplate orderRestTemplate(RestTemplateBuilder builder) {
        ClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        return builder
                .rootUri(orderServiceUri)
                .requestFactory(() -> factory)
                .build();
    }
}
