package com.codingapp.autonextauthenticationapi.service;

import com.codingapp.autonextauthenticationapi.domain.User;
import com.codingapp.autonextauthenticationapi.model.enums.UserType;
import com.codingapp.autonextauthenticationapi.model.response.LoginResponse;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {

    @InjectMocks
    private TokenService tokenService;

    private Key testSecretKey;

    @BeforeEach
    void setUp() {
        testSecretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);

        ReflectionTestUtils.setField(tokenService, "secretKey", testSecretKey);
    }

    @Test
    void createToken_shouldGenerateValidTokenWithCorrectClaims() {
        // given
        User user = User.builder()
                .id(123L)
                .email("test@example.com")
                .userType(UserType.CUSTOMER)
                .build();

        // when
        LoginResponse loginResponse = tokenService.createToken(user);

        // then
        assertThat(loginResponse).isNotNull();
        assertThat(loginResponse.getToken()).isNotNull().isNotBlank();

        String token = loginResponse.getToken();
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(testSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        assertThat(claims.getSubject()).isEqualTo("123");
        assertThat(claims.get("id", Long.class)).isEqualTo(123L);
        assertThat(claims.get("email", String.class)).isEqualTo("test@example.com");
        assertThat(claims.get("userType", String.class)).isEqualTo(UserType.CUSTOMER.name());
        assertThat(claims.getExpiration()).isAfter(new Date());
    }
}