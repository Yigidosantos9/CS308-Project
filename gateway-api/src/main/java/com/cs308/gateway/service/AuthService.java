package com.cs308.gateway.service;

import com.cs308.gateway.client.AuthClient;
import com.cs308.gateway.model.auth.request.CreateUserRequest;
import com.cs308.gateway.model.auth.request.LoginRequest;
import com.cs308.gateway.model.auth.response.LoginResponse;
import com.cs308.gateway.model.auth.response.UserDetails;
import com.cs308.gateway.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthClient authClient;
    private final ProductService productService;

    public LoginResponse login(LoginRequest request, Long guestUserId) {
        log.info("Processing login request for email: {}", request.getEmail());
        LoginResponse response = authClient.login(request);

        // If login successful and guestUserId provided, merge carts
        if (response.getToken() != null && guestUserId != null) {
            try {
                // Get user ID from token (we need to verify token to get userId)
                UserDetails userDetails = authClient.verifyToken(response.getToken());
                if (userDetails != null && userDetails.getUserId() != null) {
                    Long userId = Long.parseLong(userDetails.getUserId());
                    log.info("Merging guest cart (userId: {}) with user cart (userId: {})", guestUserId, userId);
                    productService.mergeCarts(guestUserId, userId);
                }
            } catch (Exception e) {
                log.warn("Failed to merge guest cart after login, continuing anyway: {}", e.getMessage());
                // Don't fail login if cart merge fails
            }
        }

        return response;
    }

    public LoginResponse login(LoginRequest request) {
        return login(request, null);
    }

    public String register(CreateUserRequest request) {
        log.info("Processing registration request for email: {}", request.getEmail());

        // Validate age - must be at least 16 years old
        if (request.getBirthDate() != null) {
            int age = Period.between(request.getBirthDate(), LocalDate.now()).getYears();
            if (age < 16) {
                throw new IllegalArgumentException("You must be at least 16 years old to register.");
            }
        } else {
            throw new IllegalArgumentException("Birth date is required.");
        }

        // Validate phone number - must be 10-15 digits only
        String phoneNumber = request.getPhoneNumber();
        if (phoneNumber == null || !phoneNumber.matches("^[0-9]{10,15}$")) {
            throw new IllegalArgumentException("Please enter a valid phone number (10-15 digits).");
        }

        return authClient.signUp(request);
    }

    public UserDetails verifyToken(String token) {
        log.info("Processing token verification request");
        return authClient.verifyToken(token);
    }

    public UserDetails getUserById(Long userId) {
        log.info("Processing get user by id request: {}", userId);
        return authClient.getUserById(userId);
    }
}
