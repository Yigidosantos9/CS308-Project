package com.cs308.gateway.controller;

import com.cs308.gateway.model.auth.request.CreateUserRequest;
import com.cs308.gateway.model.auth.request.LoginRequest;
import com.cs308.gateway.model.auth.response.LoginResponse;
import com.cs308.gateway.model.auth.response.UserDetails;
import com.cs308.gateway.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        log.info("BFF: Login request received for email: {}", request.getEmail());
        
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error processing login request", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(LoginResponse.builder().token(null).build());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody CreateUserRequest request) {
        log.info("BFF: Register request received for email: {}", request.getEmail());
        
        try {
            String response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error processing registration request", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/verify-token")
    public ResponseEntity<UserDetails> verifyToken(@RequestBody String token) {
        log.info("BFF: Verify token request received");
        
        try {
            UserDetails response = authService.verifyToken(token);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error processing token verification request", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}

