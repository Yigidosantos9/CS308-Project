package com.cs308.product.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI productServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Product Service API")
                        .description("REST endpoints for product catalog and cart management.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("CS308 Product Team")
                                .email("support@cs308.com")));
    }
}

