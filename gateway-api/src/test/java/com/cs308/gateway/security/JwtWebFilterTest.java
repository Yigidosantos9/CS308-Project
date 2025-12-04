package com.cs308.gateway.security;

import com.cs308.gateway.model.auth.enums.UserType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JwtWebFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private WebFilterChain chain;

    private JwtWebFilter jwtWebFilter;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        jwtWebFilter = new JwtWebFilter(jwtService);
        when(chain.filter(any())).thenReturn(Mono.empty());
    }

    @Test
    void filter_ValidToken_SetsSecurityContext() {
        String token = "valid.jwt.token";
        String authHeader = "Bearer " + token;

        MockServerHttpRequest request = MockServerHttpRequest.get("/")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(jwtService.getUserId(token)).thenReturn(Optional.of("user123"));
        when(jwtService.getUserType(token)).thenReturn(Optional.of(UserType.CUSTOMER));
        when(jwtService.getEmail(token)).thenReturn(Optional.of("user@example.com"));
        when(jwtService.getId(token)).thenReturn(Optional.of(123L));

        Mono<Void> result = jwtWebFilter.filter(exchange, chain)
                .contextWrite(ctx -> {
                    // This is where we verify the context was populated
                    return ctx;
                });

        // We need to verify the context inside the chain execution or by inspecting the
        // context
        // Since WebFilter.filter returns Mono<Void>, we can inspect the context in the
        // chain mock
        // But a better way is to wrap the chain to capture the context

        // Let's redefine chain mock to capture context
        when(chain.filter(any())).thenAnswer(invocation -> ReactiveSecurityContextHolder.getContext()
                .doOnNext(securityContext -> {
                    Authentication auth = securityContext.getAuthentication();
                    assertNotNull(auth);
                    assertTrue(auth.isAuthenticated());
                    assertEquals("ROLE_CUSTOMER", auth.getAuthorities().iterator().next().getAuthority());

                    com.cs308.gateway.security.SecurityContext customContext = (com.cs308.gateway.security.SecurityContext) auth
                            .getPrincipal();
                    assertEquals(123L, customContext.getUserId());
                    assertEquals(UserType.CUSTOMER, customContext.getUserType());
                })
                .then());

        StepVerifier.create(result)
                .verifyComplete();

        verify(jwtService).getUserId(token);
    }

    @Test
    void filter_NoHeader_DoesNotSetContext() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(chain.filter(any())).thenAnswer(invocation -> ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .switchIfEmpty(Mono.empty()) // Should be empty
                .doOnNext(auth -> fail("Should not be authenticated"))
                .then());

        StepVerifier.create(jwtWebFilter.filter(exchange, chain))
                .verifyComplete();
    }

    @Test
    void filter_InvalidToken_DoesNotSetContext() {
        String token = "invalid.token";
        String authHeader = "Bearer " + token;

        MockServerHttpRequest request = MockServerHttpRequest.get("/")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(jwtService.getUserId(token)).thenReturn(Optional.empty());

        when(chain.filter(any())).thenAnswer(invocation -> ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .switchIfEmpty(Mono.empty()) // Should be empty
                .doOnNext(auth -> fail("Should not be authenticated"))
                .then());

        StepVerifier.create(jwtWebFilter.filter(exchange, chain))
                .verifyComplete();
    }
}
