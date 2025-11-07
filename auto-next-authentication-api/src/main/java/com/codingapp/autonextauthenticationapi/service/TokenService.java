package com.codingapp.autonextauthenticationapi.service;

import com.codingapp.autonextauthenticationapi.domain.User;
import com.codingapp.autonextauthenticationapi.model.response.LoginResponse;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class TokenService {


    private Key secretKey;

    @Value("${jwt.secret}")
    private String secret;

    @PostConstruct
    void initKey() {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public LoginResponse createToken(User user) {
        Date now = new Date();
        long expirationTimeMs = 3600000;
        Date expiryDate = new Date(now.getTime() + expirationTimeMs);

        String token = Jwts.builder()
                .setSubject(String.valueOf(user.getId()))
                .claim("id", user.getId())
                .claim("userType", user.getUserType())
                .claim("email", user.getEmail())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey)
                .compact();

        return LoginResponse.builder().token(token).build();
    }
}
