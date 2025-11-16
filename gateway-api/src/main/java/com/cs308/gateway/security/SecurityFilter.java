package com.cs308.gateway.security;

import com.cs308.gateway.model.auth.enums.UserType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class SecurityFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        try {
            String authHeader = request.getHeader("Authorization");
            
            if (authHeader != null && !authHeader.isEmpty()) {
                Optional<String> userIdOpt = jwtService.getUserId(authHeader);
                Optional<String> emailOpt = jwtService.getEmail(authHeader);
                Optional<UserType> userTypeOpt = jwtService.getUserType(authHeader);
                Optional<Long> idOpt = jwtService.getId(authHeader);
                
                if (userIdOpt.isPresent() && userTypeOpt.isPresent()) {
                    SecurityContext context = SecurityContext.builder()
                            .userId(idOpt.orElse(null))
                            .email(emailOpt.orElse(null))
                            .userType(userTypeOpt.get())
                            .token(authHeader)
                            .build();
                    
                    SecurityContext.setContext(context);
                    log.debug("Security context set for user: {} with role: {}", 
                            userIdOpt.get(), userTypeOpt.get());
                }
            }
            
            filterChain.doFilter(request, response);
        } finally {
            SecurityContext.clearContext();
        }
    }
}

