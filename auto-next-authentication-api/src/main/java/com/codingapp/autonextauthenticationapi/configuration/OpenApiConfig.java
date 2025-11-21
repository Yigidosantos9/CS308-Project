package com.codingapp.autonextauthenticationapi.configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI authenticationServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Authentication Service API")
                        .description("Endpoints for user registration, login and token management.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("AutoNext Auth Team")
                                .email("support@autonext.com")));
    }
}

