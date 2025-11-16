package com.cs308.gateway.service;

import com.cs308.gateway.client.AuthClient;
import com.cs308.gateway.model.auth.request.CreateUserRequest;
import com.cs308.gateway.model.auth.request.LoginRequest;
import com.cs308.gateway.model.auth.response.LoginResponse;
import com.cs308.gateway.model.auth.response.UserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthClient authClient;

    public LoginResponse login(LoginRequest request) {
        log.info("Processing login request for email: {}", request.getEmail());
        return authClient.login(request);
    }

    public String register(CreateUserRequest request) {
        log.info("Processing registration request for email: {}", request.getEmail());
        return authClient.signUp(request);
    }

    public UserDetails verifyToken(String token) {
        log.info("Processing token verification request");
        return authClient.verifyToken(token);
    }
}

