package com.cs308.gateway.security;

import com.cs308.gateway.model.auth.enums.UserType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtWebFilter implements WebFilter {

    private final JwtService jwtService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            Optional<String> userIdOpt = jwtService.getUserId(token);
            Optional<UserType> userTypeOpt = jwtService.getUserType(token);
            Optional<String> emailOpt = jwtService.getEmail(token);
            Optional<Long> idOpt = jwtService.getId(token);

            if (userIdOpt.isPresent() && userTypeOpt.isPresent()) {
                SecurityContext context = SecurityContext.builder()
                        .userId(idOpt.orElse(null))
                        .email(emailOpt.orElse(null))
                        .userType(userTypeOpt.get())
                        .token(token)
                        .build();

                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + userTypeOpt.get().name()));

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(context,
                        null, authorities);

                return chain.filter(exchange)
                        .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication));
            }
        }

        return chain.filter(exchange);
    }
}
