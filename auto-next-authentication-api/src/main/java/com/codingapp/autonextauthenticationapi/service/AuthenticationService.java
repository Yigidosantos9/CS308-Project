package com.codingapp.autonextauthenticationapi.service;

import com.codingapp.autonextauthenticationapi.domain.User;
import com.codingapp.autonextauthenticationapi.model.enums.UserStatus;
import com.codingapp.autonextauthenticationapi.model.enums.UserType;
import com.codingapp.autonextauthenticationapi.model.request.CreateUserRequest;
import com.codingapp.autonextauthenticationapi.model.request.LoginRequest;
import com.codingapp.autonextauthenticationapi.model.response.LoginResponse;
import com.codingapp.autonextauthenticationapi.model.response.UserDetails;
import com.codingapp.autonextauthenticationapi.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import org.springframework.security.crypto.password.PasswordEncoder;

@RequiredArgsConstructor
@Component
public class AuthenticationService {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.secret}")
    private String secret;

    private Key secretKey;

    @PostConstruct
    void initKey() {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String signUp(CreateUserRequest createUserRequest) {

        userRepository.findByEmail(createUserRequest.getEmail())
                .ifPresent(user -> {
                    throw new IllegalStateException("User already exists with email: " + createUserRequest.getEmail());
                });

        User user = User.builder()
                .email(createUserRequest.getEmail())
                .password(passwordEncoder.encode(createUserRequest.getPassword()))
                .firstName(createUserRequest.getFirstName())
                .surname(createUserRequest.getLastName())
                .phoneNumber(createUserRequest.getPhoneNumber())
                .birthDate(createUserRequest.getBirthDate())
                .userType(UserType.CUSTOMER)
                .userStatus(UserStatus.ACTIVE)
                .build();

        userRepository.save(user);

        return "User signed up successfully.";
    }

    public LoginResponse login(LoginRequest loginRequest) {

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(
                        () -> new IllegalArgumentException("No user found with email: " + loginRequest.getEmail()));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials provided.");
        }

        if (!UserStatus.ACTIVE.equals(user.getUserStatus())) {
            throw new IllegalStateException("User is not active.");
        }

        return tokenService.createToken(user);
    }

    public UserDetails verifyToken(String token) {

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String userId = claims.getSubject();

            User user = userRepository.findById(Long.parseLong(userId))
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            return UserDetails.builder()
                    .userId(String.valueOf(user.getId()))
                    .email(user.getEmail())
                    .userType(user.getUserType())
                    .firstName(user.getFirstName())
                    .lastName(user.getSurname())
                    .phoneNumber(user.getPhoneNumber())
                    .birthDate(user.getBirthDate())
                    .build();

        } catch (ExpiredJwtException ex) {
            throw new RuntimeException("Token is expired", ex);
        } catch (SignatureException ex) {
            throw new RuntimeException("Invalid Signature", ex);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("JWT Claims are null", ex);
        }

    }

    public UserDetails getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        return UserDetails.builder()
                .userId(String.valueOf(user.getId()))
                .email(user.getEmail())
                .userType(user.getUserType())
                .firstName(user.getFirstName())
                .lastName(user.getSurname())
                .phoneNumber(user.getPhoneNumber())
                .birthDate(user.getBirthDate())
                .build();
    }
}
