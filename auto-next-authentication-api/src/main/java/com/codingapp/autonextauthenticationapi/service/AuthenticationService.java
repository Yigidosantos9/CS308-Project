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
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.Key;

@RequiredArgsConstructor
@Component
public class AuthenticationService {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private Key secretKey;


    public String signUp(CreateUserRequest createUserRequest) {

        userRepository.findByEmail(createUserRequest.getEmail())
                .ifPresent(user -> {
                    throw new IllegalStateException("User already exists with email: " + createUserRequest.getEmail());
                });

        User user = User.builder()
                .email(createUserRequest.getEmail())
                .password(createUserRequest.getPassword())
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
                .orElseThrow(() -> new IllegalArgumentException("No user found with email: " + loginRequest.getEmail()));

        if (!user.getPassword().equals(loginRequest.getPassword())) {
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
            String email = claims.get("email", String.class);
            String roleString = claims.get("role", String.class);

            UserType role = UserType.valueOf(roleString);

            return new UserDetails(userId, email, role);

        } catch (ExpiredJwtException ex) {
            throw new RuntimeException("Token is expired", ex);
        } catch (SignatureException ex) {
            throw new RuntimeException("Invalid Signature", ex);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("JWT Claims are null", ex);
        }


    }
}
