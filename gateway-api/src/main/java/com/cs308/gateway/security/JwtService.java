package com.cs308.gateway.security;

import com.cs308.gateway.model.auth.enums.UserType;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
public class JwtService {

    @Value("${gateway.security.jwt.secret:}")
    private String jwtSecret;

    public Optional<Claims> parseToken(String token) {
        if (token == null || token.isEmpty()) {
            return Optional.empty();
        }
        
        // Remove "Bearer " prefix if present
        String cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;
        
        return JwtUtil.parse(cleanToken, jwtSecret);
    }

    public Optional<String> getUserId(String token) {
        return parseToken(token)
                .map(Claims::getSubject);
    }

    public Optional<String> getEmail(String token) {
        return parseToken(token)
                .map(claims -> claims.get("email", String.class));
    }

    public Optional<UserType> getUserType(String token) {
        return parseToken(token)
                .map(claims -> {
                    String userTypeStr = claims.get("userType", String.class);
                    if (userTypeStr == null) {
                        return null;
                    }
                    try {
                        return UserType.valueOf(userTypeStr);
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid userType in token: {}", userTypeStr);
                        return null;
                    }
                });
    }

    public Optional<Long> getId(String token) {
        return parseToken(token)
                .map(claims -> {
                    Object idObj = claims.get("id");
                    if (idObj instanceof Long) {
                        return (Long) idObj;
                    } else if (idObj instanceof Integer) {
                        return ((Integer) idObj).longValue();
                    } else if (idObj instanceof String) {
                        return Long.parseLong((String) idObj);
                    }
                    return null;
                });
    }
}

