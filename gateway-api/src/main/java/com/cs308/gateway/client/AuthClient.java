package com.cs308.gateway.client;

import com.cs308.gateway.model.auth.request.CreateUserRequest;
import com.cs308.gateway.model.auth.request.LoginRequest;
import com.cs308.gateway.model.auth.response.LoginResponse;
import com.cs308.gateway.model.auth.response.UserDetails;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class AuthClient {

    private final RestTemplate restTemplate;

    public AuthClient(@Qualifier("authRestTemplate") RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public LoginResponse login(LoginRequest request) {
        log.debug("Calling auth service: POST /membership/login");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<LoginRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<LoginResponse> response = restTemplate.postForEntity(
                    "/membership/login",
                    entity,
                    LoginResponse.class
            );
            return response.getBody();
        } catch (HttpClientErrorException e) {
            log.error("HTTP error calling auth service login: {}", e.getStatusCode(), e);
            throw new RuntimeException("Authentication failed: " + e.getMessage(), e);
        } catch (RestClientException e) {
            log.error("Error calling auth service login", e);
            throw new RuntimeException("Failed to connect to auth service", e);
        }
    }

    public String signUp(CreateUserRequest request) {
        log.debug("Calling auth service: POST /membership/sign-up");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<CreateUserRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "/membership/sign-up",
                    entity,
                    String.class
            );
            return response.getBody();
        } catch (HttpClientErrorException e) {
            log.error("HTTP error calling auth service sign-up: {}", e.getStatusCode(), e);
            throw new RuntimeException("Registration failed: " + e.getMessage(), e);
        } catch (RestClientException e) {
            log.error("Error calling auth service sign-up", e);
            throw new RuntimeException("Failed to connect to auth service", e);
        }
    }

    public UserDetails verifyToken(String token) {
        log.debug("Calling auth service: POST /membership/verify-token");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(token, headers);

        try {
            ResponseEntity<UserDetails> response = restTemplate.postForEntity(
                    "/membership/verify-token",
                    entity,
                    UserDetails.class
            );
            return response.getBody();
        } catch (HttpClientErrorException e) {
            log.error("HTTP error calling auth service verify-token: {}", e.getStatusCode(), e);
            throw new RuntimeException("Token verification failed: " + e.getMessage(), e);
        } catch (RestClientException e) {
            log.error("Error calling auth service verify-token", e);
            throw new RuntimeException("Failed to connect to auth service", e);
        }
    }
}

