package com.cs308.gateway.security;

import com.cs308.gateway.model.auth.enums.UserType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SecurityContext {
    private Long userId;
    private String email;
    private UserType userType;
    private String token;
}
